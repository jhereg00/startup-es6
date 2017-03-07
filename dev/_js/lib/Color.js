/***
 * Color
 *
 * A simple means of controlling color.  Only handles RGB(A) right now.
 *
 * @param {number} red or {array} values or {string} hex or {number} hex
 * @param {number} green
 * @param {number} blue
 * @param {number} alpha
 */
// requirements
const extendObject = require('lib/extendObject');

class Color {
  constructor (r, g, b, a, forceParseAsFloats) {
    let values = {};
    // check if passed an array
    if (r instanceof Array) {
      values = {
        g: r[1],
        b: r[2],
        a: r[3],
        r: r[0]
      }
    }
    else if (r instanceof Object) {
      values = extendObject({
        r: 0,
        g: 0,
        b: 0,
        a: 1
      }, r);
    }
    // check if passed a hex
    // if r is a number and g is undefined, probably passed a 0xffffff style hex
    else if ((typeof r === 'string' && /^(0x|#)?([a-f0-9]{3}){1,2}$/i.test(r)) ||
             (typeof r === 'number' && g === undefined)) {
      values = Color.parseHex(r);
    }
    // passed valid values!
    else {
      values = {
        r: r,
        g: g,
        b: b,
        a: a
      }
    }

    // normalize floats to int of 255
    // if passed a decimal value, assume it's this style
    if (forceParseAsFloats || values.r % 1 || values.g % 1 || values.b % 1) {
      for (let prop in values) {
        if (prop !== 'a')
          values[prop] = Math.floor(values[prop] * 255);
      }
    }

    if (values.a === undefined) {
      values.a = 1;
    }

    extendObject(this, values, true);
  }

  toFloatArray () {
    return [
      this.r / 255,
      this.g / 255,
      this.b / 255,
      this.a
    ];
  }

  static parseHex (hex) {
    if (typeof hex === 'string') {
      hex = hex.replace(/(^|[x#])([a-f0-9])([a-f0-9])([a-f0-9])$/, ($0, $1, $2, $3, $4) => '' + $2 + $2 + $3 + $3 + $4 + $4);
      hex = parseInt(hex.replace(/^0x|#/,''), 16);
    }
    return {
      r: hex >>> 16,
      g: hex >>> 8 & 0xff,
      b: hex & 0xff,
      a: 1
    }
  }
}

module.exports = Color;
