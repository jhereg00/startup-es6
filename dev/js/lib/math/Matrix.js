/**
 * Matrix
 * Based heavily (i.e., largely copies) on the Sylvester library
 * Some differences, though:
 * 	 can be created with new keyword
 * 	 row/column indexes are 0 based, not 1 based
 * 	 not all methods have been ported over
 *
 * @param {array[]} elements - an array of arrays from which to build the matrix [rows[cols]]
 *
 * @method {Matrix} setElements - set the elements of this matrix
 *   @param {array[]} elements or Matrix or Vector to draw elements from
 *   @returns self
 * @method {boolean} equals
 *   @param {Matrix} comparedMatrix
 *   @returns matricesAreEqual
 * @method {Matrix} duplicate
 *   @returns {Matrix} new Matrix instance
 * @method {Matrix} map
 *   @param {Function} thing to do to each value
 *	 [@param] {Object} context for `this` keyword in function
 *	 @returns {Matrix} new Matrix instance
 * @method {boolean} isSameSizeAs
 *	 @param {Matrix} comparedMatrix
 *	 @returns {boolean}
 * @method {Matrix} add
 *   @param {Matrix} affectingMatrix
 *   @returns {Matrix} result
 * @method {Matrix} subtract
 *   @param {Matrix} affectingMatrix
 *   @returns {Matrix} result
 * @method {Matrix} multiply
 *   @param {Matrix}
 *   @returns {Matrix} product
 * @method inspect
 *   @returns {String} human readable output of matrix
 * @method flatten
 *   @returns {Array} values as a single array
 * @method transpose
 *   @returns {Matrix} this matrix transposed, meaning with rows exchanged with columns
 * @method inverse
 *   @returns {Matrix} new matrix of this one's inverse
 *
 * @property {object} dimensions
 * @property {boolean} isSingular
 * @property {boolean} isSquare
 * @property {number} determinant
 */

// settings
const PRECISION = 1e-6;

class Matrix {
	constructor (elements = []) {
		this.setElements(elements);
	}

	/**
	 * set this matrix' elements
	 * @param {array[]} elements or Matrix or Vector to draw elements from
	 * @returns {Matrix} self
	 */
	setElements (els) {
    let i,
				j,
				rows = 0,
				columns = 0,
				elements = els.elements || els; // if Vector or another Matrix passed, grab from its elements property

		// assuming we have a valid first element, start some loops to save the elements to this object
    if (elements[0] && typeof(elements[0][0]) !== 'undefined') {
      i = elements.length;
      this.elements = [];
      while (i--) {
				j = elements[i].length;
        this.elements[i] = [];
        while (j--) {
          this.elements[i][j] = elements[i][j];
        }
      }
    }
		else {
			// just a single array?  Make a 1xn matrix
	    this.elements = [];
	    for (let i = 0, n = elements.length; i < n; i++) {
	      this.elements.push([elements[i]]);
	    }
		}
		this.dimensions = {
			rows: this.elements.length || 0,
			columns: this.elements[0] && this.elements[0].length || 0
		}
    return this;
  }

	/**
	 * check if equal to another matrix
	 * @param {Matrix} comparedMatrix
	 * @returns {boolean} matricesAreEqual
	 */
	equals (matrix) {
		let M = matrix.elements || matrix;
		// make sure it's a matrix, not just arrays
		if (!M[0] || typeof(M[0][0]) === 'undefined') { M = new Matrix(M).elements; }
		// empty matrices?
		if (this.elements.length === 0 || M.length === 0)
      return this.elements.length === M.length;
		// easy part, same size?
    if (this.elements.length !== M.length) { return false; }
    if (this.elements[0].length !== M[0].length) { return false; }
		// real comparison
		let i = this.elements.length, nj = this.elements[0].length, j;
    while (i--) { j = nj;
      while (j--) {
        if (Math.abs(this.elements[i][j] - M[i][j]) > PRECISION) { return false; }
      }
    }
    return true;
	}

	/**
	 *	duplicate this matrix
	 *	@returns {Matrix} new Matrix instance
	 */
	duplicate () {
		return new Matrix (this);
	}

	/**
	 *	call a function on each element, just like Array.map
	 *	@param {Function} thing to do to each value
	 *	[@param] {Object} context for `this` keyword in function
	 *	@returns {Matrix} new Matrix instance
	 */
	map (fn, context) {
		if (this.elements.length === 0) { return new Matrix([]); }
    let els = [], i = this.elements.length, nj = this.elements[0].length, j;
    while (i--) { j = nj;
      els[i] = [];
      while (j--) {
        els[i][j] = fn.call(context, this.elements[i][j], i, j);
      }
    }
    return new Matrix(els);
	}

	/**
	 *	check if same size as passed matrix
	 *	@param {Matrix} compared matrix
	 *	@returns {boolean}
	 */
	isSameSizeAs (matrix) {
		if (!(matrix instanceof Matrix)) {
			matrix = new Matrix(matrix);
		}
		return (this.dimensions.rows === matrix.dimensions.rows && this.dimensions.columns === matrix.dimensions.columns);
	}

	/**
	 *	add
	 *	@param {Matrix} to add to this one
	 *	@returns {Matrix} new Matrix of result
	 */
	add (matrix) {
		if (this.elements.length === 0) return this.map(function(x) { return x });
    let M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = new Matrix(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; } // can only add same dimensioned matrices
    return this.map(function(x, i, j) { return x + M[i][j]; });
	}

	/**
	 * subtract
	 * @param {Matrix} to subtract from this one
	 * @returns {Matrix} new Matrix of result
	 */
	subtract (matrix) {
		if (this.elements.length === 0) return this.map(function(x) { return x });
    let M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = new Matrix(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; }
    return this.map(function(x, i, j) { return x - M[i][j]; });
	}

	/**
	 * .canMultiplyFromLeft
	 * @param {Matrix}
	 * @returns {boolean} if matrix is compatible to multiply with this one
	 */
	canMultiplyFromLeft (matrix) {
    if (this.elements.length === 0) { return false; }
    if (!(matrix instanceof Matrix)) { matrix = new Matrix(matrix); }
    // this.columns should equal matrix.rows
    return (this.dimensions.columns === matrix.dimensions.rows);
  }

	/**
	 *	.multiply
	 *	@param {Matrix}
	 *	@returns {Matrix} product
	 */
  multiply (matrix) {
    if (this.elements.length === 0) { return null; }
    if (!matrix.elements) {
      return this.map(function(x) { return x * matrix; });
    }
    if (!this.canMultiplyFromLeft(matrix)) { return null; }
    let M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = new Matrix(M).elements; }
    let i = this.elements.length,
				nj = M[0].length,
				j;
    let cols = this.elements[0].length,
				c,
				elements = [],
				sum;
    while (i--) { j = nj;
      elements[i] = [];
      while (j--) {
				c = cols;
        sum = 0;
        while (c--) {
          sum += this.elements[i][c] * M[c][j];
        }
        elements[i][j] = sum;
      }
    }
    return new Matrix(elements);
  }

	/**
	 *	.inspect
	 *	@returns {String} human readable output of matrix
	 */
	inspect () {
    let matrix_rows = [];
    let n = this.elements.length;
    if (n === 0) return '[]';
    for (let i = 0; i < n; i++) {
      matrix_rows.push(this.elements[i].join(' '));
    }
    return matrix_rows.join('\n');
  }

	/**
	 *	flatten
	 *	@returns {Array} values as a single array
	 */
	flatten () {
		let out = [];
		let type = Uint16Array;
		for (let i = 0; i < this.elements.length; i++) {
			out = out.concat(this.elements[i]);
			this.elements[i].forEach(function (x) {
				if (x % 1 !== 0) {
					type = Float32Array;
				}
			});
		}
		return new type(out);
	}

	/**
	 *	transpose
	 *	@returns {Matrix} this matrix transposed, meaning with rows exchanged with columns
	 */
	transpose () {
    if (this.elements.length === 0) return new Matrix([]);
    let rows = this.elements.length, cols = this.elements[0].length, j;
    let elements = [], i = cols;
    while (i--) { j = rows;
      elements[i] = [];
      while (j--) {
        elements[i][j] = this.elements[j][i];
      }
    }
    return new Matrix(elements);
  }

	/**
	 *	useful for internal purposes...
	 */
	toRightTriangular () {
    if (this.elements.length === 0) return new Matrix([]);
    let M = this.dup(), els;
    let n = this.elements.length, i, j, np = this.elements[0].length, p;
    for (i = 0; i < n; i++) {
      if (M.elements[i][i] === 0) {
        for (j = i + 1; j < n; j++) {
          if (M.elements[j][i] !== 0) {
            els = [];
            for (p = 0; p < np; p++) { els.push(M.elements[i][p] + M.elements[j][p]); }
            M.elements[i] = els;
            break;
          }
        }
      }
      if (M.elements[i][i] !== 0) {
        for (j = i + 1; j < n; j++) {
          let multiplier = M.elements[j][i] / M.elements[i][i];
          els = [];
          for (p = 0; p < np; p++) {
            // Elements with column numbers up to an including the number of the
            // row that we're subtracting can safely be set straight to zero,
            // since that's the point of this routine and it avoids having to
            // loop over and correct rounding errors later
            els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
          }
          M.elements[j] = els;
        }
      }
    }
    return M;
  }

	/**
	 *	inverse
	 *	@returns {Matrix} new matrix of this one's inverse
	 */
	inverse () {
    if (this.elements.length === 0) { return null; }
    if (!this.isSquare || this.isSingular) { return null; }
    let n = this.elements.length, i= n, j;
    let M = this.augment(Matrix.I(n)).toRightTriangular();
    let np = M.elements[0].length, p, els, divisor;
    let inverse_elements = [], new_element;
    // Matrix is non-singular so there will be no zeros on the
    // diagonal. Cycle through rows from last to first.
    while (i--) {
      // First, normalise diagonal elements to 1
      els = [];
      inverse_elements[i] = [];
      divisor = M.elements[i][i];
      for (p = 0; p < np; p++) {
        new_element = M.elements[i][p] / divisor;
        els.push(new_element);
        // Shuffle off the current row of the right hand side into the results
        // array as it will not be modified by later runs through this loop
        if (p >= n) { inverse_elements[i].push(new_element); }
      }
      M.elements[i] = els;
      // Then, subtract this row from those above it to give the identity matrix
      // on the left hand side
      j = i;
      while (j--) {
        els = [];
        for (p = 0; p < np; p++) {
          els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
        }
        M.elements[j] = els;
      }
    }
    return new Matrix(inverse_elements);
  }

	augment (matrix) {
    if (this.elements.length === 0) { return this.dup(); }
    let M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = new Matrix(M).elements; }
    let T = this.dup(), cols = T.elements[0].length;
    let i = T.elements.length, nj = M[0].length, j;
    if (i !== M.length) { return null; }
    while (i--) { j = nj;
      while (j--) {
        T.elements[i][cols + j] = M[i][j];
      }
    }
    return T;
  }

	////////////////////////////
	// derived properties
	////////////////////////////
	get isSingular () {
    return (this.isSquare && this.determinant === 0);
  }

	get isSquare () {
    let cols = (this.elements.length === 0) ? 0 : this.elements[0].length;
    return (this.elements.length === cols);
  }

	get determinant () {
    if (this.elements.length === 0) { return 1; }
    if (!this.isSquare) { return null; }
    let M = this.toRightTriangular();
    let det = M.elements[0][0], n = M.elements.length;
    for (let i = 1; i < n; i++) {
      det = det * M.elements[i][i];
    }
    return det;
  }

	/////////////////////////
	// statics
	/////////////////////////
	/**
	 *	.create
	 *	@param {Array} elements - an array of arrays from which to build the matrix [rows[cols]]
	 *	@returns shiny new Matrix
	 */
	static create (elements) {
		return new Matrix (elements);
	}
	/**
	 *	.I
	 *	@param {int} size
	 *	@returns {Matrix} square identity matrix of `n` size
	 */
	static I (n) {
	  var els = [], i = n, j;
	  while (i--) { j = n;
	    els[i] = [];
	    while (j--) {
	      els[i][j] = (i === j) ? 1 : 0;
	    }
	  }
	  return new Matrix(els);
	};
	static identity (...args) {
		return Matrix.I.apply(args);
	}

	/**
	 *	rotations
	 */
	static rotation (angle, a /* axis vector */) {
		if (!a) {
	    return Matrix.create([
	      [Math.cos(angle),  -Math.sin(angle)],
	      [Math.sin(angle),   Math.cos(angle)]
	    ]);
	  }
	  var axis = a.dup();
	  if (axis.elements.length !== 3) { return null; }
	  var mod = axis.modulus();
	  var x = axis.elements[0]/mod, y = axis.elements[1]/mod, z = axis.elements[2]/mod;
	  var s = Math.sin(angle), c = Math.cos(angle), t = 1 - c;
	  // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
	  // That proof rotates the co-ordinate system so angle becomes -angle and sin
	  // becomes -sin here.
	  return Matrix.create([
	    [ t*x*x + c, t*x*y - s*z, t*x*z + s*y ],
	    [ t*x*y + s*z, t*y*y + c, t*y*z - s*x ],
	    [ t*x*z - s*y, t*y*z + s*x, t*z*z + c ]
	  ]);
	}
	static rotationX (angle) {
		var c = Math.cos(angle), s = Math.sin(angle);
	  return Matrix.create([
	    [  1,  0,  0, 0 ],
	    [  0,  c, -s, 0 ],
	    [  0,  s,  c, 0 ],
			[	 0,  0,  0, 1 ]
	  ]);
	}
	static rotationY (angle) {
	  var c = Math.cos(angle), s = Math.sin(angle);
	  return Matrix.create([
	    [  c,  0,  -s, 0 ],
	    [  0,  1,  0, 0 ],
	    [  s,  0,  c, 0 ],
			[	 0,  0,  0, 1 ]
	  ]);
	};
	static rotationZ (angle) {
	  var c = Math.cos(angle), s = Math.sin(angle);
	  return Matrix.create([
	    [  c, -s,  0,	0 ],
	    [  s,  c,  0,	0 ],
	    [  0,  0,  1,	0 ],
			[	 0,	 0,  0, 1 ]
	  ]);
	};
	static rotation3d (x,y,z) {
		return Matrix.rotationZ(z).multiply(Matrix.rotationX(x)).multiply(Matrix.rotationY(y));
	}
	/**
	 *	translation
	 */
	static translation3d (x,y,z) {
		return Matrix.create([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[x, y, z, 1]
		]);
	}
}

// aliases
Matrix.prototype.eql = Matrix.prototype.equals;
Matrix.prototype.dup = Matrix.prototype.duplicate;
Matrix.prototype.x = Matrix.prototype.multiply;

module.exports = Matrix;
