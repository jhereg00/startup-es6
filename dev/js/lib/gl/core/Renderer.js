/**
 * Renderer
 *
 * Class that can be extended to create a new renderer.
 *
 * @param options - all of these are optional
 *   @param canvas - HTMLCanvasElement to apply renderer to
 *   @param contextAttributes - attributes for the WebGLRenderingContext. Don't mess with these unless you're sure.
 *     @param alpha
 *     @param depth
 *     @param stencil
 *     @param antialias
 *     @param premultipliedAlpha
 *     @param preserveDrawingBuffer
 */

const extendObject = require('lib/helpers/extendObject');

const DEFAULT_CONTEXT_ATTRIBUTES = {
	alpha: false,
	depth: true,
	stencil: false,
	antialias: true,
	premultipliedAlpha: true,
	preserveDrawingBuffer: false
};

class Renderer {
	constructor (options) {
		options = options || {};
    // establish this renderer's params
		this.canvas = options.canvas || document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		let contextAttributes = extendObject({}, DEFAULT_CONTEXT_ATTRIBUTES, options.contextAttributes);
		this.gl = this.canvas.getContext("webgl", contextAttributes) || this.canvas.getContext("experimental-webgl", contextAttributes);
    // check that it worked
		if (this.gl === null) {
			if (this.canvas.getContext('webgl') !== null) {
				throw 'Error creating WebGL context with your selected attributes.';
			}
			else {
				throw 'Error creating WebGL context.';
			}
		}

	}
}

module.exports = Renderer;
