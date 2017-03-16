/**
 * AjaxRequest
 *
 * Makes a request to the given url using the given parameters.  Returns a Promise.
 * Also tracks state, allows callbacks for given states, and can be aborted.
 *
 * @param {object} options
 *   @param {string} url
 *   @param {string} method - default: "GET"
 *	 @param {object} data - arbitrary data to send with request
 *	 @param {function} onComplete - function to fire whether succeeded or failed
 *	 @param {function} onSuccess - function to fire when status is 2** or 3**
 *	 @param {function} onError - function to fire when status is 4** or 5**
 * @returns {Promise}
 *
 * @prop {Promise} promise
 *
 * @static @method {Promise} make - an alternate way of creating an AjaxRequest. Returns the created AjaxRequest.
 * @static @method {Array<AjaxRequest>} getActiveRequests
 * @static @enum readyState
 */
/* eslib */
/* global Promise */

// requirements
const extendObject = require('lib/helpers/extendObject');

// settings
const DEFAULTS = {
	method: "GET"
};
let activeRequests = [];

class AjaxRequest {
	constructor (options) {
		this.settings = extendObject({}, DEFAULTS, options);
		if (!this.settings.url) {
			throw new Error("No url passed to AjaxRequest");
		}

		// normalize our data for the call
		this._dataStr = "";
		for (let prop in this.settings.data) {
			this._dataStr += (this._dataStr === "" ? "" : "&") + prop + "=" + encodeURI(this.settings.data[prop]);
		}

		// create state functions
		this.stateFns = [];
		for (let prop in AjaxRequest.readyState) {
			this.stateFns[AjaxRequest.readyState[prop]] = [];
		}

		this._successFns = [];
		this._rejectFns = [];

		this.promise = this._doCall();

		if (this.settings.onSuccess) {
			this.promise.then(this.settings.onSuccess, this.settings.onError);
		}
		else if (this.settings.onError) {
			this.promise.catch(this.settings.onError);
		}

		return this;
	}

	_doCall () {
		// create a new XMLHttpRequest
		return new Promise((resolve, reject) => {
			let xhttp = this.xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = (function () {
				if (this.stateFns[this.xhttp.readyState] && this.stateFns[this.xhttp.readyState].length) {
					for (let i = 0, len = this.stateFns[this.xhttp.readyState].length; i < len; i++) {
						this.stateFns[this.xhttp.readyState][i](this.xhttp);
					}
				}
			}).bind(this);
			this.addStateListener(AjaxRequest.readyState.DONE, this._callComplete.bind(this, resolve, reject));

			// open and send the request
			xhttp.open(this.settings.method, (this._dataStr && this.settings.method === 'GET' ? this.settings.url + '?' + this._dataStr : this.settings.url), true);
			// web-standards compliant x-requested-with
			xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			if (this.settings.method !== 'GET' && this._dataStr) {
				xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhttp.send(this._dataStr);
			}
			else {
				xhttp.send();
			}
			activeRequests.push(this);
		});
	}

	_callComplete (resolve, reject) {
		// done
		if (this.settings.complete && typeof this.settings.complete === 'function') {
			this.settings.complete(this.xhttp);
		}

		activeRequests.splice(activeRequests.indexOf(this), 1);

		// success or fail
		if (this.xhttp.status >= 200 && this.xhttp.status < 400) {
			resolve(this.xhttp.responseText);
		}
		else {
			reject(this.xhttp.status);
		}
	}

	// public methods
	addStateListener (state, fn) {
		// call immediately if already at or passed that state
		if (this.xhttp.readyState >= state) {
			fn(this.xhttp);
		}
		this.stateFns[state].push(fn);
	}

	then (resolve, reject) {
		return this.promise.then(resolve, reject);
	}

	catch (reject) {
		return this.promise.catch(reject);
	}

	abort () {
		this.xhttp.abort();
	}

	// statics
	static make (options) {
		return new AjaxRequest(options);
	}
	static getActiveRequests () {
		return activeRequests;
	}

	static get readyState() {
		return {
			UNSENT: 0,
			OPENED: 1,
			HEADERS_RECEIVED: 2,
			LOADING: 3,
			DONE: 4
		};
	}
}

module.exports = AjaxRequest;
