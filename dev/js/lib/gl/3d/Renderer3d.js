/**
 * Renderer3d
 *
 */
const Renderer = require('lib/gl/core/Renderer');
const GLBuffer = require('lib/gl/core/GLBuffer');
const GLProgram = require('lib/gl/core/GLProgram');

class Renderer3d extends Renderer {
	constructor (options) {
		super(options);

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

		// draw lines
		for (let i = 0; i < 3; i++) {
			let colorArray = [0, 0, 0, 1];
			colorArray[i] = 1;
			this.gl.uniform4fv(this._programs.unlit.u.uColor, new Float32Array(colorArray));
			this.gl.drawArrays(this.gl.LINES, i * 2, 2);
		}
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
		}
	}
	disableWorldSpace () {
		this._drawWorldSpaceEnabled = false;
	}


	add (item) {}

	// item property handling
}

module.exports = Renderer3d;
