/**
 * Renderer3d
 *
 */
const Renderer = require('lib/gl/core/Renderer');
const GLBuffer = require('lib/gl/core/GLBuffer');
const GLProgram = require('lib/gl/core/GLProgram');
const GLFramebuffer = require('lib/gl/core/GLFramebuffer');
const GLCubeFramebuffer = require('lib/gl/core/GLCubeFramebuffer');
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
		this.gl.enable(this.gl.CULL_FACE);

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
		this._renderShadowObjects();
	}
	drawCubeShadowMap (light) {
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
		this._buffers.vertexPosition.bindToPosition(this._programs.depth.a.aPosition);

		this.gl.uniform3fv(this._programs.depth.u.uCameraPosition, new Float32Array([light._position.x, light._position.y, light._position.z]));
		for (let dir in light.shadowCamera.cameras) {
			lightProps.shadowMap.bindDirection(dir);
			this.clear(true, true, false);
			// console.log(dir, this.gl.getFramebufferAttachmentParameter(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE));
			this.gl.uniformMatrix4fv(this._programs.depth.u.uProjectionMatrix, false, light.shadowCamera.cameras[dir].projectionMatrix.asFloat32());
			this._renderShadowObjects();
		}
	}
	_renderShadowObjects () {
		this._objects.forEach((obj) => {
			if (!obj.castsShadows) {
				return;
			}
			this.gl.uniformMatrix4fv(this._programs.depth.u.uMVMatrix, false, obj.mvMatrix.asFloat32());
			obj.meshes.forEach((mesh) => {
				let meshProps = this._instancedProperties.get(mesh);
				this.gl.drawElements(this.gl.TRIANGLES, meshProps.count, this.gl.UNSIGNED_SHORT, meshProps.start * 2);
			});
		});
	}
	renderObjectsToDepth () {}
	cullLights () {}

	_bindCommonLightAttributes (program, light, uniformName, uniformIndex) {
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
	}
	_bindPointLight (program, lightIndex, textureIndex) {
		let light = this._lights.point[lightIndex];
		let uniformName = "uPointLights";
		let props = this._instancedProperties.get(light);
		this.gl.uniform1i(
			program.getArrayPosition('uPointShadows', lightIndex),
			textureIndex);
		this.gl.uniform1i(
			program.getStructPosition(uniformName, lightIndex, 'shadowMapSize'),
			props.shadowMap.size);
		this.gl.activeTexture(this.gl['TEXTURE' + textureIndex]);
		props.shadowMap.glTexture.bind();

		this.gl.uniform1f(
			program.getStructPosition(uniformName, lightIndex, 'radius'),
			light.radius);
		this.gl.uniform1f(
			program.getStructPosition(uniformName, lightIndex, 'attenuationStart'),
			light.attenuationStart);

		this._bindCommonLightAttributes(program, light, uniformName, lightIndex);
	}
	_bindDirectionalLight (program, lightIndex, textureIndex) {
		let light = this._lights.directional[lightIndex];
		let uniformName = "uDirectionalLights";
		let props = this._instancedProperties.get(light);
		this.gl.uniform1i(
			program.getArrayPosition('uDirectionalShadows', lightIndex),
			textureIndex);
		this.gl.uniform1i(
			program.getStructPosition(uniformName, lightIndex, 'shadowMapSize'),
			props.shadowMap.size);
		this.gl.activeTexture(this.gl['TEXTURE' + textureIndex]);
		props.shadowMap.glTexture.bind();

		this.gl.uniform3fv(
			program.getStructPosition(uniformName, lightIndex, 'direction'),
			light.direction.asFloat32());
		this.gl.activeTexture(this.gl['TEXTURE' + textureIndex]);
		props.shadowMap.glTexture.bind();
		if (light.shadowCamera)
			this.gl.uniformMatrix4fv(
				program.getStructPosition(uniformName, lightIndex, 'projectionMatrix'),
				false,
				light.shadowCamera.projectionMatrix.asFloat32());

		this._bindCommonLightAttributes(program, light, uniformName, lightIndex);
	}

	forwardRenderObject (obj, forceNewProgram) {
		let objMaterial = obj.material;
		obj.meshes.forEach((mesh) => {
			let meshProps = this._instancedProperties.get(mesh);
			let material = objMaterial || mesh.getMaterial();
			let materialProps = this._instancedProperties.get(material);
			let program = materialProps.program;
			let usedTextures = 0;

			if ((!materialProps.program || forceNewProgram) && !materialProps.isBuilding) {
				// add usedTextures for materials with textures
				// TODO: make material specific
				var newProgram = new GLProgram(this.gl, {
					vertexShader: "forward.vs.glsl",
					fragmentShader: "forward.fs.glsl",
					definitions: {
						USE_NORMALS: '',
						NUM_DIRECTIONAL_LIGHTS: this._lights.directional && this._lights.directional.length,
						NUM_POINT_LIGHTS: this._lights.point && this._lights.point.length
					}
				});
				console.log(this._lights.point && this._lights.point.length);
				materialProps.isBuilding = true;

				newProgram.onReady(() => {
					// temp limitation, should move to uid props
					this._buffers.elements.bind();
					this._buffers.vertexPosition.bindToPosition(newProgram.a.aPosition);
					this._buffers.vertexNormals.bindToPosition(newProgram.a.aNormal);
					materialProps.program = newProgram;
					materialProps.isBuilding = false;
				});
			}

			if (!program || !program.use())
				return false;

			// console.log('vec4(vec3(' + brightness + '), 1.0)');

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
			this.gl.uniform4fv(program.u.uColor, new Float32Array(material.color));
			this.gl.uniform4fv(program.u.uSpecularColor, new Float32Array(material.specularColor));
			this.gl.uniform1f(program.u.uSpecularExponent, material.specularExponent);
			this.gl.uniform1f(program.u.uSpecularity, material.specularity);

			// bind point lights
			let maxLights = this._maxTextures - usedTextures;
			let textureIndex = usedTextures;
			if (this._lights.point) {
				for (let i = 0, len = this._lights.point.length; i < len && i < maxLights; i++) {
					this._bindPointLight(program, i, textureIndex);
					usedTextures++;
					textureIndex++;
				}
			}
			if (this._lights.directional) {
				for (let i = 0, len = this._lights.directional.length; i < len && i < maxLights; i++) {
					this._bindDirectionalLight(program, i, textureIndex);
					usedTextures++;
					textureIndex++;
				}
			}
			this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);
			//
			// // bind as many lights as we can, then do a pass.  Keep going if needed
			// let inc = this._maxTextures - usedTextures;
			// for (let i = 0, len = this._lights.point.length; i < len; i += inc) {
			// 	// make this add to last pass if not the first
			// 	this.gl.blendFunc(this.gl.ONE, i === 0 ? this.gl.ZERO : this.gl.ONE);
			//
			// 	let
			// 		numDirectional = 0,
			// 		numPoint = 0,
			// 		numSpot = 0,
			// 		shadowIndex = 0,
			// 		shadowCubeIndex = 0,
			// 		textureIndex = usedTextures;
			// 	for (let j = 0; j < inc; j++) {
			// 		let light = this._lights[j + i];
			// 		if (!light) {
			// 			break;
			// 		}
			//
			// 		// figure out what to bind to
			// 		let uniformName, uniformIndex;
			// 		let props = this._instancedProperties.get(light);
			//
			// 		switch (light.type) {
			// 			case "directional": {
			// 				uniformName = "uDirectionalLights";
			// 				uniformIndex = numDirectional;
			// 				numDirectional++;
			// 				this.gl.uniform3fv(
			// 					program.getStructPosition(uniformName, uniformIndex, 'direction'),
			// 					light.direction.asFloat32());
			// 				this.gl.uniform1i(
			// 					program.getArrayPosition('uShadow2d', shadowIndex++),
			// 					textureIndex);
			// 				this.gl.uniform1i(
			// 					program.getStructPosition(uniformName, uniformIndex, 'shadowMapSize'),
			// 					props.shadowMap.size);
			// 				this.gl.activeTexture(this.gl['TEXTURE' + textureIndex]);
			// 				props.shadowMap.glTexture.bind();
			// 				if (light.shadowCamera)
			// 					this.gl.uniformMatrix4fv(
			// 						program.getStructPosition(uniformName, uniformIndex, 'projectionMatrix'),
			// 						false,
			// 						light.shadowCamera.projectionMatrix.asFloat32());
			// 				break;
			// 			}
			// 			case "point": {
			// 				uniformName = "uPointLights";
			// 				uniformIndex = numPoint;
			// 				numPoint++;
			// 				this.gl.uniform1i(
			// 					program.getArrayPosition('uShadowCubes', shadowCubeIndex++),
			// 					textureIndex);
			// 				this.gl.uniform1i(
			// 					program.getStructPosition(uniformName, uniformIndex, 'shadowMapSize'),
			// 					props.shadowMap.size);
			// 				this.gl.activeTexture(this.gl['TEXTURE' + textureIndex]);
			// 				props.shadowMap.glTexture.bind();
			//
			// 				this.gl.uniform1f(
			// 					program.getStructPosition(uniformName, uniformIndex, 'radius'),
			// 					light.radius);
			// 				this.gl.uniform1f(
			// 					program.getStructPosition(uniformName, uniformIndex, 'attenuationStart'),
			// 					light.attenuationStart);
			// 				break;
			// 			}
			// 		}
			//
			// 		// bind common attributes
			// 		this.gl.uniform3fv(
			// 			program.getStructPosition(uniformName, uniformIndex, 'position'),
			// 			new Float32Array([light._position.x, light._position.y, light._position.z]));
			//
			// 		this.gl.uniform1f(
			// 			program.getStructPosition(uniformName, uniformIndex, 'bias'),
			// 			light.bias);
			//
			// 		this.gl.uniform4fv(
			// 			program.getStructPosition(uniformName, uniformIndex, 'ambient'),
			// 			new Float32Array(light.ambient));
			// 		this.gl.uniform1f(
			// 			program.getStructPosition(uniformName, uniformIndex, 'ambientIntensity'),
			// 			light.ambientIntensity);
			//
			// 		this.gl.uniform4fv(
			// 			program.getStructPosition(uniformName, uniformIndex, 'diffuse'),
			// 			new Float32Array(light.diffuse));
			// 		this.gl.uniform1f(
			// 			program.getStructPosition(uniformName, uniformIndex, 'diffuseIntensity'),
			// 			light.diffuseIntensity);
			//
			// 		this.gl.uniform4fv(
			// 			program.getStructPosition(uniformName, uniformIndex, 'specular'),
			// 			new Float32Array(light.specular));
			// 		this.gl.uniform1f(
			// 			program.getStructPosition(uniformName, uniformIndex, 'specularIntensity'),
			// 			light.specularIntensity);
			//
			// 		this.gl.uniform1f(
			// 			program.getStructPosition(uniformName, uniformIndex, 'minShadowBlur'),
			// 			light.minShadowBlur);
			// 		this.gl.uniform1f(
			// 			program.getStructPosition(uniformName, uniformIndex, 'maxShadowBlur'),
			// 			light.maxShadowBlur);
			//
			// 		this.gl.uniform1f(
			// 			program.getStructPosition(uniformName, uniformIndex, 'shadowDistance'),
			// 			light.shadowDistance || light.radius);
			//
			// 		textureIndex++;
			// 	}
			//
			// 	this.gl.uniform1i(program.u.uNumDirectionalLights, numDirectional);
			// 	this.gl.uniform1i(program.u.uNumPointLights, numPoint);

				// offset is *2 to handle the UNSIGNED_SHORT
				this.gl.drawElements(this.gl.TRIANGLES, meshProps.count, this.gl.UNSIGNED_SHORT, meshProps.start * 2);
			// }
		});
	}
	postProcess () {}
	renderToCanvas () {}

	render () {
		// this.clear();
		this._buffers.elements.bind();
		// draw shadowmaps
		this.gl.disable(this.gl.BLEND);
		for (let type in this._lights) {
			if (this._lights[type] && this._lights[type].length) {
				this._lights[type].forEach((light) => {
					if (type === 'directional' || type === 'spot')
						this.draw2dShadowMap(light);
					else if (type === 'point')
						this.drawCubeShadowMap(light);
				});
			}
		}
		// cull lights
		// for each opaque object, forward render it
		this.gl.enable(this.gl.BLEND);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.resetViewport();
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.clear();
		this._objects.forEach((obj) => this.forwardRenderObject(obj, this._lights.needsUpdate));
		// for each transparent object, forward render it

		// debug visual aids
		if (this._drawWorldSpaceEnabled) {
			this._drawWorldSpace();
		}

		// postprocessing

		// put it on the canvas

		// reset update trackers
		this._lights.needsUpdate = false;
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
			if (!this._lights[type]) {
				this._lights[type] = [];
			}
			if (this._lights[type].indexOf(element) === -1) {
				this._lights[type].push(element);

				// build shadowmap buffers
				let instancedProps = this._instancedProperties.get(element);
				if (element.type === 'directional') {
					instancedProps.shadowMap = new GLFramebuffer(this.gl, { size: element.shadowResolution });
				}
				else if (element.type === 'point') {
					instancedProps.shadowMap = new GLCubeFramebuffer(this.gl, { size: element.shadowResolution });
				}
			}
			this._lights.needsUpdate = true;
		}
	}

	// item property handling
}

module.exports = Renderer3d;
