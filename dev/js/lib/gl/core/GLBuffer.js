/**
 * GLBuffer
 *
 * Controls a basic buffers for WebGL.  Is _not_ applicable
 * to multiple Renderers.  Instead should be children of them,
 * probably not even being affected from outside their parent.
 *
 * Expected to be extended by an implementation for GLArrayBuffer
 * or GLElementArrayBuffer.
 *
 * @param {WebGLRenderingContext} gl
 * @param options
 *   @param {enum} glBufferType - default: "ARRAY_BUFFER"
 *   @param {int} attributeSize - default: 1
 *	 @param {enum} glDataType - default: "FLOAT"
 *
 * alternatively, instead of passing an object, you can just pass an integer to be used as attributeSize
 *
 * @method append
 *   @param {Array} data
 *	 @returns {object}
 * 	   @param {int} start - index of where the appended data starts in the buffer's data, normalized for attributeSize
 *		 @param {int} length - count of the number of the appended items, normalized for attributeSize
 * @method get
 *   @param {int} index
 *	 @param {int, optional} count
 * @method clear - strip data from the internal array. Careful, this changes the size of the array and will affect any pointers to indices later in the array
 *   @param {int} startClearIndex - default 0
 *   @param {int} clearLength - default all
 * @method bind - make this buffer active
 * @method bindToPosition - binds to an attribute position
 *   @param {int} position
 *
 * @prop length - read only length normalized for attributeSize
 */

/* eslint */
/* global Float32Array, Uint16Array */
const extendObject = require('lib/helpers/extendObject');

const DEFAULTS = {
	glBufferType: "ARRAY_BUFFER",
	attributeSize: 1,
	glDataType: "FLOAT"
};
// attributes to convert from strings to enums
const STRING_TO_ENUM = [
	'glBufferType',
	'glDataType'
];

class GLBuffer {
	constructor (gl, options) {
		// make sure we got good arguments
		if (!gl || !(gl instanceof WebGLRenderingContext)) {
			throw new Error(this.constructor.name + " requires a valid WebGLRenderingContext as its first argument");
		}

		// if only passed a number, use it for attributeSize
		if (typeof options === "number") {
			options = {
				attributeSize: options
			};
		}
		options = options || {};
		extendObject(this, DEFAULTS, options);
		STRING_TO_ENUM.forEach((str) => {
			if (typeof this[str] === "string") {
				this[str] = gl[this[str]];
			}
			if (this[str] === undefined) {
				throw new Error(this.constructor.name + " passed invalid value " + options[str] + " for property " + str);
			}
		});

		this._data = [];
		this._markers = {};
		this._buffer = gl.createBuffer();
		this._gl = gl;
		this._needsUpdate = false;
	}

	append (...args) {
		let start = (this._data.length) / this.attributeSize;
		args.forEach((a) => {
			if (a instanceof Array) {
				// crazy that this is fastest, but there you go
				// jsperf: https://jsperf.com/array-concat-vs-push-2/17
				Array.prototype.push.apply(this._data, a);
			}
			else if (typeof a === 'number') {
				this._data.push(a);
			}
		});
		let length = ((this._data.length) / this.attributeSize) - start;
		let output = {
			start: start,
			length: length
		};

		this._needsUpdate = true;

		return output;
	}

	get (start, length = 1) {
		let output = [];
		for (let i = 0; i < length; i++) {
			for (let j = 0; j < this.attributeSize; j++) {
				let index = (start * this.attributeSize) + (i * this.attributeSize) + j;
				if (this._data[index] !== undefined)
					output.push(this._data[index]);
				else
					break;
			}
		}

		return output;
	}

	clear (start = 0, length = 0) {
		// clearing all?
		if (start === 0 && !length) {
			return this._data = [];
		}

		this._needsUpdate = true;

		return this._data = this._data.slice(0, start * this.attributeSize).concat(this._data.slice((start + length) * this.attributeSize));
	}

	bind () {
		if (this._needsUpdate) {
			let data = this.glDataType === this._gl.FLOAT ? new Float32Array(this._data) : new Uint16Array(this._data);
			this._gl.bufferData(this._buffer, data, this._gl.STATIC_DRAW);
		}
		this._gl.bindBuffer(this.glBufferType, this._buffer);
	}

	bindToPosition (position) {
		if (position < 0 || position === undefined)
			throw new Error("Attempt to bind GLBuffer to invalid position " + position);

		this.bind();
		this._gl.vertexAttribPointer(
      position,
      this.attributeSize,
      this.glDataType,
      this._gl.FALSE,
      0,
      0
    );
	}


	// getters / setters
	get length () {
		return this._data.length / this.attributeSize;
	}
	set length (v) {
		console.warn("Attempt made to set length of " + this.constructor.name + ". This property is read-only.");
		return;
	}
}

module.exports = GLBuffer;
