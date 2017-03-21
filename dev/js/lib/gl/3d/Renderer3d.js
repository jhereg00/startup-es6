/**
 * Renderer3d
 *
 */
const Renderer = require('lib/gl/core/Renderer');

class Renderer3d extends Renderer {
	constructor (options) {
		super(options);
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
	render () {}
	postProcess () {}
	renderToCanvas () {}

	add (item) {}

	// item property handling
}

module.exports = Renderer3d;
