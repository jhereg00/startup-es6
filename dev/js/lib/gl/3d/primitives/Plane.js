/**
 * Plane
 *
 * Creates a new Mesh object with positions to be a flat plane.
 */
const extendObject = require('lib/helpers/extendObject');
const Mesh = require('lib/gl/3d/Mesh');

const DEFAULTS = {
	width: 1,
	depth: 1
};

class Plane extends Mesh {
	constructor (options) {
		let settings = extendObject({}, DEFAULTS, options);

		let positions = [];
		let normals = [];
		let elements = [];

		let
			w = settings.width,
			d = settings.depth;

		// top & bottom
		positions.push(
			-w / 2, 0, d / 2,
			w / 2, 0, d / 2,
			w / 2, 0, -d / 2,
			-w / 2, 0, -d / 2
		);
		normals.push(
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0
		);
		elements.push(
			0, 1, 2,
			0, 2, 3
		);

		super({
			name: options.name || null,
			positions: positions,
			normals: normals,
			elements: elements,
			material: options.material || 'default'
		});

		this.width = w;
		this.depth = d;
	}
}

module.exports = Plane;
