/**
 * AjaxRequest class
 *
 * Create a new instance to make a new request.  All options other than url are
 * optional.
 *
 * All functions (complete, success, and error) are passed the response text
 * and the xhttp request as arguments.
 *
 * @param {object} options
 *   @param {string} url
 *   @param {string} method - default: 'GET'
 *   @param {object} data - arbitrary data to send
 *   @param {function} complete - function to call when request is complete, successful or not
 *   @param {function} success - function to call when request completes with status code 2xx
 *   @param {function} error - function to call when request fails or completes with status code 4xx or 5xx
 *
 * @method addStateListener
 *   @param {int} stateIndex
 *   @param {Function} callback - function to call when that state is reached
 *     passed 2 arguments: `{string} responseText`, `{XMLHttpRequest} the request object`
 * @method getReadyState
 *   @returns {int} readyState of request
 * @method abort
 *
 * @static @enum readyState
 */
// requirements
const extendObject = require('lib/extendObject');

// settings
const DEFAULTS = {
  method: 'GET'
}
let activeRequests = [];

// the class
class AjaxRequest {
  constructor (options) {
    if (!options || !options.url) {
      throw new Error('AjaxRequest must have a url defined');
      return false;
    }

    this.stateFns = [[],[],[],[],[]];
    this.options = extendObject({}, DEFAULTS, options);

    // handle data
    let dataStr = "";
    for (let prop in this.options.data) {
  		dataStr += (dataStr === "" ? "" : "&") + prop + "=" + encodeURI(this.options.data[prop]);
    }

    // make actual request
  	let xhttp = this.xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = (function () {
      if (this.stateFns[xhttp.readyState] && this.stateFns[xhttp.readyState].length) {
        for (let i = 0, len = this.stateFns[xhttp.readyState].length; i < len; i++) {
          this.stateFns[xhttp.readyState][i](xhttp.responseText, xhttp);
        }
      }
    }).bind(this);
    this.addStateListener(AjaxRequest.readyState.DONE, this.onComplete.bind(this));

    // open and send the request
  	xhttp.open(this.options.method,(dataStr && this.options.method === 'GET' ? this.options.url + '?' + dataStr : this.options.url),true);
    // web-standards compliant x-requested-with
    xhttp.setRequestHeader("X-Requested-With","XMLHttpRequest");
  	if (this.options.method !== 'GET' && dataStr) {
  		xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  		xhttp.send(dataStr);
  	}
  	else {
  		xhttp.send();
  	}
    activeRequests.push(this);
  }
  // function we'll call when done
  onComplete (responseText, xhttp) {
    // done
    if (this.options.complete && typeof this.options.complete === 'function') {
      this.options.complete(responseText, xhttp);
    }

    // success or fail
    if (xhttp.status >= 200 && xhttp.status <= 299) {
      if (this.options.success && typeof this.options.success === 'function') {
        this.options.success(responseText, xhttp);
      }
    }
    else if (this.options.error && typeof this.options.error === 'function') {
      this.options.error(responseText, xhttp);
    }

    activeRequests.splice(activeRequests.indexOf(this),1);
  }
  // add a listener state
  addStateListener (stateIndex, fn) {
    // call immediately if already at or passed that state
    if (this.xhttp.readyState >= stateIndex) {
      fn(this.xhttp.responseText, this.xhttp);
    }
    this.stateFns[stateIndex].push(fn);
  }
  // access the xhttp's ready state easily
  getReadyState () {
    return this.xhttp.readyState;
  }
  // bail
  abort () {
    console.log('aborting AJAX call');
    this.xhttp.abort();
  }

  // readyState enum
  static get readyState() {
    return {
      UNSENT: 0,
      OPENED: 1,
      HEADERS_RECEIVED: 2,
      LOADING: 3,
      DONE: 4
    }
  }
  static get activeRequests () {
    return activeRequests;
  }
}

module.exports = AjaxRequest;
