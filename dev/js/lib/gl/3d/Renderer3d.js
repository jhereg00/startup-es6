/**
 * Renderer3d
 *
 */
const Renderer = require('lib/gl/core/Renderer');
const GLBuffer = require('lib/gl/core/GLBuffer');
const GLProgram = require('lib/gl/core/GLProgram');
const Matrix4 = require('lib/math/Matrix4');
const PerspectiveCamera = require('lib/gl/3d/PerspectiveCamera');

class Renderer3d extends Renderer {
	constructor (options) {
		super(options);

		this.activeCamera = new PerspectiveCamera({
			aspectRatio: this.canvas.width / this.canvas.height
		});

		this._drawables = [];
		this._lights = [];

		this._buffers = {};
		this._programs = {};

		// create some requirements
		this._buffers.vertexPosition = new GLBuffer(this.gl, { attributeSize: 3 });

		this._programs.unlit = new GLProgram(this.gl, {
			vertexShader: "forward.vs.glsl",
			fragmentShader: "unlit.fs.glsl"
		});
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

	renderObjectsToDepth () {}
	cullLights () {}
	forwardRenderObject () {}
	postProcess () {}
	renderToCanvas () {}

	render () {
		// draw depth only
		// cull lights
		// for each opaque object, forward render it
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
		this.gl.uniform4fv(this._programs.unlit.u.uColor, new Float32Array([.5, .5, .5, .3]));
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


	add (item) {}

	// item property handling
}

module.exports = Renderer3d;
