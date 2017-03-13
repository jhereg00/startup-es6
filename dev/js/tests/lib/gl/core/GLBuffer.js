/**
 * GLArrayBuffer tests
 */
const expect = chai.expect;
const GLBuffer = require('lib/gl/core/GLBuffer');

let makeTempBuffer = function (gl, length = 10) {
	let buffer = new GLBuffer(gl, {
		attributeSize: 3
	});
	for (let i = 0; i < length; i++) {
		buffer.append(i, i, i);
	}

	return buffer;
};

describe("GLBuffer", function () {
	let initBuffer = function (gl, options) {
		return new GLBuffer(gl, options);
	};
	let canvas = document.createElement('canvas');
	let gl = canvas.getContext('experimental-webgl');

	it("requires a valid WebGLRenderingContext as the first argument", function () {
		expect(initBuffer).to.throw(Error, /WebGLRenderingContext/);
	});
	it("requires glBufferType and glDataType to have valid values", function () {
		expect(initBuffer.bind(undefined, gl, {
			glBufferType: "FOO"
		})).to.throw(Error, /FOO/);
	});
	it("can be passed an integer as the second argument to be used as attributeSize", function () {
		let buffer = new GLBuffer(gl, 3);
		expect(buffer.attributeSize).to.equal(3);
	});

	describe("append", function () {
		it("accepts arrays", function () {
			let buffer = new GLBuffer(gl);
			buffer.append([1, 2, 3, 4]);
			buffer.append([5, 6, 7, 8]);
			expect(buffer._data).to.eql([1, 2, 3, 4, 5, 6, 7, 8]);
		});
		it("accepts many arguments", function () {
			let buffer = new GLBuffer(gl);
			buffer.append(1, 2, 3, 4);
			buffer.append(5, 6, 7, 8);
			expect(buffer._data).to.eql([1, 2, 3, 4, 5, 6, 7, 8]);
		});
		it("returns start index and length, normalized for attributeSize", function () {
			let buffer = new GLBuffer(gl, {
				attributeSize: 3
			});
			buffer.append(1, 1, 1);
			buffer.append(2, 2, 2);
			let out = buffer.append(3, 3, 3);
			expect(out).to.eql({
				start: 2,
				length: 1
			});
		});
	});

	describe("length", function () {
		let buffer = makeTempBuffer(gl, 243);
		it("is a property storing data length, normalized for attributeSize", function () {
			expect(buffer.length).to.equal(243);
		});
		it("is read only, but fails sets silently", function () {
			let trySetLength = function () {
				buffer.length = 2;
			};
			expect(trySetLength).not.to.throw();
			expect(buffer.length).to.equal(243);
		});
	});

	describe("get", function () {
		let buffer = makeTempBuffer(gl);

		it("returns a single item", function () {
			expect(buffer.get(0)).to.eql([0, 0, 0]);
			expect(buffer.get(7)).to.eql([7, 7, 7]);
		});
		it("returns a group of items", function () {
			expect(buffer.get(1, 3)).to.eql([
				1, 1, 1,
				2, 2, 2,
				3, 3, 3
			]);
			expect(buffer.get(8, 9)).to.eql([
				8, 8, 8,
				9, 9, 9
			]);
		});
	});

	describe("clear", function () {
		let buffer = makeTempBuffer(gl);

		it("clears a section of buffer", function () {
			expect(buffer.get(4, 2)).to.eql([
				4, 4, 4,
				5, 5, 5
			]);
			buffer.clear(4, 2);
			expect(buffer.length).to.equal(8);
			expect(buffer.get(4, 2)).to.eql([
				6, 6, 6,
				7, 7, 7
			]);
			buffer.clear(4, 0);
			expect(buffer.get(4, 2)).to.eql([
				6, 6, 6,
				7, 7, 7
			]);
		});
		it("clears the entire buffer", function () {
			buffer.clear();
			expect(buffer.length).to.equal(0);
			expect(buffer._data).to.eql([]);
		});
	});
});
