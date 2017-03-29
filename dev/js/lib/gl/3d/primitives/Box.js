/**
 * Box
 *
 * Creates a new Mesh object with positions to be a box.
 */
const extendObject = require('lib/helpers/extendObject');
const Mesh = require('lib/gl/3d/Mesh');

const DEFAULTS = {
	width: 1,
	height: 1,
	depth: 1
};

class Box extends Mesh {
	constructor (options) {
		let settings = extendObject({}, DEFAULTS, options);

		let positions = [];
		let normals = [];
		let elements = [];

		let
			w = settings.width,
			h = settings.height,
			d = settings.depth;

		// each side
		// left & right
		positions.push(
			-w / 2, h / 2, d / 2,
			-w / 2, h / 2, -d / 2,
			-w / 2, -h / 2, -d / 2,
			-w / 2, -h / 2, d / 2,

			w / 2, h / 2, d / 2,
			w / 2, h / 2, -d / 2,
			w / 2, -h / 2, -d / 2,
			w / 2, -h / 2, d / 2
		);
		normals.push(
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,

			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0
		);
		elements.push(
			0, 1, 2,
			0, 2, 3,

			4, 5, 6,
			4, 6, 7
		);

		// front & back
		positions.push(
			-w / 2, h / 2, -d / 2,
			w / 2, h / 2, -d / 2,
			w / 2, -h / 2, -d / 2,
			-w / 2, -h / 2, -d / 2,

			-w / 2, h / 2, d / 2,
			w / 2, h / 2, d / 2,
			w / 2, -h / 2, d / 2,
			-w / 2, -h / 2, d / 2,
		);
		normals.push(
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,

			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		);
		elements.push(
			8, 9, 10,
			8, 10, 11,

			12, 13, 14,
			12, 14, 15
		);

		// top & bottom
		positions.push(
			-w / 2, h / 2, d / 2,
			w / 2, h / 2, d / 2,
			w / 2, h / 2, -d / 2,
			-w / 2, h / 2, -d / 2,

			-w / 2, -h / 2, d / 2,
			w / 2, -h / 2, d / 2,
			w / 2, -h / 2, -d / 2,
			-w / 2, -h / 2, -d / 2
		);
		normals.push(
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,

			0, -1, 0,
			0, -1, 0,
			0, -1, 0,
			0, -1, 0
		);
		elements.push(
			16, 17, 18,
			16, 18, 19,

			20, 21, 22,
			20, 22, 23
		);

		super({
			name: options.name || null,
			positions: positions,
			normals: normals,
			elements: elements,
			material: options.material || 'default'
		});

		this.width = w;
		this.height = h;
		this.depth = d;
	}
}

module.exports = Box;
