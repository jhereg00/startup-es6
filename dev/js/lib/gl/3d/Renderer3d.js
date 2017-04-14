/**
 * Renderer3d
 *
 */
const Renderer = require('lib/gl/core/Renderer');
const GLBuffer = require('lib/gl/core/GLBuffer');
const GLProgram = require('lib/gl/core/GLProgram');
const GLFramebuffer = require('lib/gl/core/GLFramebuffer');
const PerspectiveCamera = require('lib/gl/3d/PerspectiveCamera');
const Object3d = require('lib/gl/3d/Object3d');
const Light = require('lib/gl/3d/Light');
const Matrix4 = require('lib/math/Matrix4');
const extendObject = require('lib/helpers/extendObject');

class Renderer3d extends Renderer {
	constructor (options) {
		super(options);

		this.gl.clearDepth(1.0);
    // enable depth testing
		this.gl.enable(this.gl.DEPTH_TEST);
		// make nearer things obscure farther things
		this.gl.depthFunc(this.gl.LEQUAL);

		this._maxTextures = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);

		this.activeCamera = new PerspectiveCamera({
			aspectRatio: this.canvas.width / this.canvas.height
		});

		this._objects = [];
		this._lights = [];

		this._buffers = {};
		this._programs = {};

		// create some requirements
		this._buffers.vertexPosition = new GLBuffer(this.gl, { attributeSize: 3 });
		this._buffers.vertexNormals = new GLBuffer(this.gl, { attributeSize: 3 });
		this._buffers.elements = new GLBuffer(this.gl, {
			glBufferType: this.gl.ELEMENT_ARRAY_BUFFER,
			attributeSize: 1,
			glDataType: this.gl.UNSIGNED_SHORT });

		this._programs.unlit = new GLProgram(this.gl, {
			vertexShader: "forward.vs.glsl",
			fragmentShader: "unlit.fs.glsl"
		});
		this._programs.depth = new GLProgram(this.gl, {
			vertexShader: "forward.vs.glsl",
			fragmentShader: "depth.fs.glsl",
			definitions: {
				ORTHOGRAPHIC_PROJECTION: ''
			}
		});

		// depth renderbuffer
		this.renderbuffer = this.gl.createRenderbuffer();
		this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);
		this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.canvas.width, this.canvas.height);

		// extensions
		this.gl.getExtension('OES_texture_float');
		this.gl.getExtension('OES_standard_derivatives');
	}


	// pseudo code for this mess:
	// 1. bind the program, which is connected to the material
	// 2. assign material uniforms
	// 3. get buffers from object(s)
	// 4. draw it

	// forward+ 2.5 rendering:
	//	0. depth pass
	//	1. light culling
	//	2. opaque pass
	//	3. transparent pass
	//	4. reflection pass?
	//
	// references:
	//   https://www.3dgep.com/forward-plus/
	//	 https://github.com/shrekshao/WebGL-Tile-Based-Forward-Plus-Renderer

	draw2dShadowMap (light) {
		let cam = light.shadowCamera;
		if (!cam) {
			return false;
		}

		let lightProps = this._instancedProperties.get(light);

		// depth rendering everything
		if (!this._programs.depth.ready)
			return false;
		this._programs.depth.use();
		lightProps.shadowMap.use();
		this.clear();
		this._buffers.vertexPosition.bindToPosition(this._programs.depth.a.aPosition);
		this.gl.uniformMatrix4fv(this._programs.depth.u.uProjectionMatrix, false, light.shadowCamera.projectionMatrix.asFloat32());
		this.gl.uniform3fv(this._programs.depth.u.uCameraPosition, new Float32Array([light._position.x, light._position.y, light._position.z]));
		// this.gl.uniform1f(this._programs.depth.u.uMaxDepth, light.shadowDistance || light.radius);
		// this.gl.uniform3fv(this._programs.depth.u.uLightPosition, new Float32Array([light.position.x, light.position.y, light.position.z]));
		this._objects.forEach((obj) => {
			this.gl.uniformMatrix4fv(this._programs.depth.u.uMVMatrix, false, obj.mvMatrix.asFloat32());
			obj.meshes.forEach((mesh) => {
				let meshProps = this._instancedProperties.get(mesh);
				this.gl.drawElements(this.gl.TRIANGLES, meshProps.count, this.gl.UNSIGNED_SHORT, meshProps.start * 2);
			});
		});
	}
	renderObjectsToDepth () {}
	cullLights () {}
	forwardRenderObject (obj) {
		obj.meshes.forEach((mesh) => {
			let meshProps = this._instancedProperties.get(mesh);
			let material = mesh.getMaterial();
			let materialProps = this._instancedProperties.get(material);
			let program = materialProps.program;
			let usedTextures = 0;
			if (!materialProps.program) {
				// add usedTextures for materials with textures
				// TODO: make material specific
				program = new GLProgram(this.gl, {
					vertexShader: "forward.vs.glsl",
					fragmentShader: "forward.fs.glsl",
					definitions: {
						USE_NORMALS: '',
						MAX_LIGHTS: this._maxTextures - usedTextures
					}
				});
				materialProps.program = program;
			}

			if (!program.ready)
				return false;
			program.use();

			this._buffers.vertexPosition.bindToPosition(program.a.aPosition);
			this._buffers.vertexNormals.bindToPosition(program.a.aNormal);

			// bind projection
			if (this.activeCamera) {
				// console.log(this._programs.unlit.u.uProjectionMatrix, this.activeCamera.projectionMatrix.asFloat32());
				this.gl.uniformMatrix4fv(program.u.uProjectionMatrix, false, this.activeCamera.projectionMatrix.asFloat32());
				this.gl.uniform3fv(program.u.uCameraPosition, new Float32Array([this.activeCamera._position.x, this.activeCamera._position.y, this.activeCamera._position.z]));
			}
			this.gl.uniformMatrix4fv(program.u.uMVMatrix, false, obj.mvMatrix.asFloat32());
			this.gl.uniformMatrix4fv(program.u.uNormalMatrix, false, obj.normalMatrix.asFloat32());
			// temp
			this.gl.uniform4fv(program.u.uColor, [.7, .8, .5, 1]);

			// bind as many lights as we can, then do a pass.  Keep going if needed
			let inc = this._maxTextures - usedTextures;
			for (let i = 0, len = this._lights.length; i < len; i += inc) {
				// make this add to last pass if not the first
				this.gl.blendFunc(this.gl.ONE, i === 0 ? this.gl.ZERO : this.gl.ONE);

				let
					numDirectional = 0,
					numPoint = 0,
					numSpot = 0,
					shadowIndex = 0,
					textureIndex = usedTextures;
				for (let j = 0; j < inc; j++) {
					let light = this._lights[j + i];
					if (!light) {
						break;
					}

					// figure out what to bind to
					let uniformName, uniformIndex;
					let props = this._instancedProperties.get(light);

					switch (light.type) {
						case "directional": {
							uniformName = "uDirectionalLights";
							uniformIndex = numDirectional;
							numDirectional++;
							this.gl.uniform3fv(
								program.getStructPosition(uniformName, uniformIndex, 'direction'),
								light.direction.asFloat32());
							this.gl.uniform1i(
								program.getArrayPosition('uShadow2d', shadowIndex++),
								textureIndex);
							this.gl.uniform1i(
								program.getStructPosition(uniformName, uniformIndex, 'shadowMapSize'),
								props.shadowMap.size);
							this.gl.activeTexture(this.gl['TEXTURE' + textureIndex]);
							props.shadowMap.glTexture.bind();
							break;
						}
					}

					// bind common attributes
					this.gl.uniform3fv(
						program.getStructPosition(uniformName, uniformIndex, 'position'),
						new Float32Array([light._position.x, light._position.y, light._position.z]));

					this.gl.uniform1f(
						program.getStructPosition(uniformName, uniformIndex, 'bias'),
						light.bias);

					this.gl.uniform4fv(
						program.getStructPosition(uniformName, uniformIndex, 'ambient'),
						new Float32Array(light.ambient));
					this.gl.uniform1f(
						program.getStructPosition(uniformName, uniformIndex, 'ambientIntensity'),
						light.ambientIntensity);

					this.gl.uniform4fv(
						program.getStructPosition(uniformName, uniformIndex, 'diffuse'),
						new Float32Array(light.diffuse));
					this.gl.uniform1f(
						program.getStructPosition(uniformName, uniformIndex, 'diffuseIntensity'),
						light.diffuseIntensity);

					this.gl.uniform4fv(
						program.getStructPosition(uniformName, uniformIndex, 'specular'),
						new Float32Array(light.specular));
					this.gl.uniform1f(
						program.getStructPosition(uniformName, uniformIndex, 'specularIntensity'),
						light.specularIntensity);

					this.gl.uniform1f(
						program.getStructPosition(uniformName, uniformIndex, 'minShadowBlur'),
						light.minShadowBlur);
					this.gl.uniform1f(
						program.getStructPosition(uniformName, uniformIndex, 'maxShadowBlur'),
						light.maxShadowBlur);

					this.gl.uniform1f(
						program.getStructPosition(uniformName, uniformIndex, 'shadowDistance'),
						light.shadowDistance || light.radius);

					if (light.shadowCamera)
						this.gl.uniformMatrix4fv(
							program.getStructPosition(uniformName, uniformIndex, 'projectionMatrix'),
							false,
							light.shadowCamera.projectionMatrix.asFloat32());
				}

				this.gl.uniform1i(program.u.uNumDirectionalLights, numDirectional);

				// offset is *2 to handle the UNSIGNED_SHORT
				this.gl.drawElements(this.gl.TRIANGLES, meshProps.count, this.gl.UNSIGNED_SHORT, meshProps.start * 2);
			}
		});
	}
	postProcess () {}
	renderToCanvas () {}

	render () {
		// this.clear();
		this._buffers.elements.bind();
		// draw shadowmaps
		this.gl.disable(this.gl.BLEND);
		this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
		this._lights.forEach((light) => {
			if (light.type === 'directional' || light.type === 'spot')
				this.draw2dShadowMap(light);
		});
		// cull lights
		// for each opaque object, forward render it
		this.gl.enable(this.gl.BLEND);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.resetViewport();
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.clear();
		this._objects.forEach((obj) => this.forwardRenderObject(obj));
		// for each transparent object, forward render it

		// debug visual aids
		if (this._drawWorldSpaceEnabled) {
			this._drawWorldSpace();
		}

		// postprocessing

		// put it on the canvas
	}

	// visual aids
	_drawWorldSpace () {
		// start the program
		if (!this._programs.unlit.ready)
			return this._programs.unlit.onReady(this.render.bind(this));

		this._programs.unlit.use();

		// bind the buffer
		this._buffers.worldSpace.bindToPosition(this._programs.unlit.a.aPosition);

		// bind projection
		if (this.activeCamera) {
			// console.log(this._programs.unlit.u.uProjectionMatrix, this.activeCamera.projectionMatrix.asFloat32());
			this.gl.uniformMatrix4fv(this._programs.unlit.u.uProjectionMatrix, false, this.activeCamera.projectionMatrix.asFloat32());
		}
		this.gl.uniformMatrix4fv(this._programs.unlit.u.uMVMatrix, false, Matrix4.I.asFloat32());

		// draw lines
		for (let i = 0; i < 3; i++) {
			let colorArray = [0, 0, 0, 1];
			colorArray[i] = 1;
			this.gl.uniform4fv(this._programs.unlit.u.uColor, new Float32Array(colorArray));
			this.gl.drawArrays(this.gl.LINES, i * 2, 2);
		}
		this.gl.uniform4fv(this._programs.unlit.u.uColor, new Float32Array([.5, .5, .5, .8]));
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
		this.gl.enable(this.gl.BLEND);
		this.gl.drawArrays(this.gl.LINES, 6, this._buffers.worldSpace.length - 12);
		this.gl.uniform4fv(this._programs.unlit.u.uColor, new Float32Array([.5, .5, .5, .1]));
		this.gl.drawArrays(this.gl.TRIANGLES, this._buffers.worldSpace.length - 12, 12);
	}
	enableWorldSpace () {
		this._drawWorldSpaceEnabled = true;
		if (!this._buffers.worldSpace) {
			this._buffers.worldSpace = new GLBuffer(this.gl, { attributeSize: 3 });
			this._buffers.worldSpace.append([
				-1000, 0, 0,
				1000, 0, 0,
				0, -1000, 0,
				0, 1000, 0,
				0, 0, -1000,
				0, 0, 1000
			]);

			// build floor
			for (let i = -100; i <= 100; i += 1) {
				if (i !== 0) {
					this._buffers.worldSpace.append([
						-1000, 0, i,
						1000, 0, i,
						i, 0, -1000,
						i, 0, 1000
					]);
				}
			}
			this._buffers.worldSpace.append([
				-1000, 0, -1000,
				1000, 0, -1000,
				-1000, 0, 1000,
				-1000, 0, 1000,
				1000, 0, -1000,
				1000, 0, 1000
			]);
		}
	}
	disableWorldSpace () {
		this._drawWorldSpaceEnabled = false;
	}


	addElement (element) {
		if (element instanceof Object3d) {
			if (this._objects.indexOf(element) === -1) {
				this._objects.push(element);
				element.meshes.forEach((mesh) => {
					let meshProps = {
						start: this._buffers.elements.length,
						end: this._buffers.elements.length + mesh.elements.length,
						count: mesh.elements.length
					};
					let instancedProps = this._instancedProperties.get(mesh);
					extendObject(instancedProps, meshProps);
					this._buffers.elements.append(mesh.elements.map((x) => x + this._buffers.vertexPosition.length));
					this._buffers.vertexPosition.append(mesh.positions);
					this._buffers.vertexNormals.append(mesh.normals);
				});

				element.children.forEach((child) => this.addElement(child));
			}
		}
		else if (element instanceof Light) {
			let type = element.type;
			if (!type) {
				console.warn("attempt made to add Light without a defined type. Ignoring.");
				return;
			}
			if (this._lights.indexOf(element) === -1) {
				this._lights.push(element);

				// build shadowmap buffers
				let instancedProps = this._instancedProperties.get(element);
				if (element.type === 'directional') {
					instancedProps.shadowMap = new GLFramebuffer(this.gl, { size: element.shadowResolution });
				}
			}
		}
	}

	// item property handling
}

module.exports = Renderer3d;
