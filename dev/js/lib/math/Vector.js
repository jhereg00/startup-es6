/**
 * Vector
 *
 * @param x
 * @param y
 * @param optional z
 * @param optional w
 *
 * @method {Vector} clone
 * @method {Vector, self} add
 *   @param Vector or Number
 * @method {Vector, self} multiply
 *   @param Vector or Number
 * @method {number} dot
 *   @param Vector
 * @method {Vector, self} normalize
 *
 * @prop x
 * @prop y
 * @prop z
 * @prop w
 * @prop length - number of axes in the vector
 * @prop magnitude
 */

class Vector {
  constructor () {
    if (arguments[0] instanceof Array)
      this._data = arguments[0];
    else
      this._data = Array.from(arguments);

    // force at least a 2 axis vector
    if (!this._data[0])
      this._data[0] = 0;
    if (!this._data[1])
      this._data[1] = 0;

    return this;
  }

  ////////
  // private
  ////////


  ////////
  // public
  ////////
  clone () {
    return new Vector(this._data);
  }

  get (index) {
    return this._data[index];
  }

  add (value) {
    if (typeof value === 'number') {
      this._data = this._data.map((x) => x + value);
    }
    else if ((value instanceof Vector || value instanceof Array) && this.length === value.length) {
      this._data = this._data.map((x,i) => x + value[i]);
    }
    else {
      throw new Error ("Vector with length " + this.length + " cannot add " + (typeof value) + " " + value);
    }
    return this;
  }
  subtract (value) {
    if (typeof value === 'number')
      this._data = this._data.map((x) => x - value);
    else if ((value instanceof Vector || value instanceof Array) && this.length === value.length) {
      this._data = this._data.map((x,i) => x - value[i]);
    }
    else {
      throw new Error (this + " cannot subtract value " + value);
    }
    return this;
  }

  multiply (value) {
    if (typeof value === 'number') {
      this._data = this._data.map((x) => x * value);
    }
    else if ((value instanceof Vector || value instanceof Array) && this.length === value.length) {
      this._data = this._data.map((x,i) => x * value[i]);
    }
    else {
      throw new Error ("Vector with length " + this.length + " cannot be multiplied by " + (typeof value) + " " + value);
    }
    return this;
  }

  dot (value) {
    if (value.length !== this.length) {
      throw new Error ("Cannot create dot product between vector with length " + this.length + " and " + value);
    }
    let out = 0;
    for (let i = 0, len = this.length; i < len; i++) {
      out += (this._data[i] * value[i]);
    }
    return out;
  }

  normalize () {
    let multiplier = 1 / this.magnitude;
    return this.multiply(multiplier);
  }


  ////////
  // get/set
  ////////
  get x () {
    return this._data[0];
  }
  set x (v) {
    this._data[0] = v;
  }

  get y () {
    return this._data[1];
  }
  set y (v) {
    this._data[1] = v;
  }

  get z () {
    return this._data[2];
  }
  set z (v) {
    this._data[2] = v;
  }

  get w () {
    return this._data[3];
  }
  set w (v) {
    this._data[3] = v;
  }

  get magnitude () {
    let toSqrt = 0;
    for (let i = 0; i < this._data.length; i++) {
      toSqrt += this._data[i] * this._data[i];
    }
    return Math.sqrt(toSqrt);
  }

  get length () {
    return this._data.length;
  }
}
// make it array-like
for (let i = 0; i < 4; i++) {
  Object.defineProperty(Vector.prototype, i, { get: function () { return this._data[i]; }});
}

module.exports = Vector;
