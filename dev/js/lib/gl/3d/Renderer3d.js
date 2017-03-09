/**
 * Renderer3d
 *
 */
const Renderer = require('lib/gl/core/Renderer');

class Renderer3d extends Renderer {
	constructor (options) {
		super(options);
	}

	renderToBuffer () {
		// pseudo code for this mess:
		// 1. bind the program, which is connected to the material
		// 2. assign material uniforms
		// 3. get buffers from object(s)
		// 4. draw it
	}
}

module.exports = Renderer3d;
