/**
 * InstancedProperties
 *
 * Keeps track of objects' properties that need to tie to a Renderer
 */
const UID = require('lib/helpers/uid');

class InstancedProperties {
	constructor () {
		this._data = {};
	}

	get (obj, uid) {
		if (obj) {
			if (obj.uid === undefined) {
				obj.uid = UID.make();
			}
			uid = isNaN(uid) ? obj.uid : uid;

			if (this._data[uid] === undefined) {
				this._data[uid] = {};
			}
		}

		return this._data[uid];
	}

	clear () {
		this._data = {};
	}
}

module.exports = InstancedProperties;
