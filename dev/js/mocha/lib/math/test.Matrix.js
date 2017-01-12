const expect = chai.expect;
const spy = sinon.spy;
const Matrix = require('lib/math/Matrix');

describe("Matrix", function () {
  it("defines its elements using a passed array of arrays", function () {
    let m = new Matrix ([
      [1,2,3],
      [4,5,6],
      [7,8,9]
    ]);
    expect(m.elements).to.eql([
      [1,2,3],
      [4,5,6],
      [7,8,9]
    ]);
  });

  it("defines its elements using another passed matrix, effectively duplicating it", function () {
    let m1 = new Matrix([
      [1,2],
      [3,4]
    ]);
    let m2 = new Matrix(m1);
    expect(m2.elements).to.eql([
      [1,2],
      [3,4]
    ]);
  });

  describe("methods", function () {
    describe("equals", function () {
      it("returns true if two matrices are equal", function () {
        let m1 = new Matrix([[1,2],[3,4]]);
        let m2 = new Matrix([[1,2],[3,4]]);
        expect(m1 === m2).to.be.false; // prove they're not the same object
        expect(m1.equals(m2)).to.be.true;
      });
      it("returns false otherwise", function () {
        let m1 = new Matrix([[1,2],[3,4]]);
        let m2 = new Matrix([[1,2],[3,5]]);
        let m3 = new Matrix([[1,2]]);
        expect(m1.equals(m2)).to.be.false;
        expect(m1.equals(m3)).to.be.false;
      });
    });
    describe("duplicate", function () {
      it("returns a new matrix object with the same elements", function () {
        let m1 = new Matrix([[1,2],[3,4]]);
        let m2 = m1.duplicate();
        expect(m1 === m2).to.be.false; // prove they're not the same object
        expect(m1).to.eql(m2);
      });
    });
    describe("map", function () {
      it("performs a function on each element of a matrix", function () {
        let fn = function (x) {
          return x += 1;
        };
        fn = spy(fn);
        let m1 = new Matrix([[1,2],[3,4]]);
        let m2 = m1.map(fn);
        expect(fn.callCount).to.be.equal(4);
        expect(m2).to.eql(new Matrix([[2,3],[4,5]]));
      });
      it("calls the function with the passed context as `this`", function () {
        let fn = spy();
        let m1 = new Matrix([[1,2],[3,4]]);
        let x = {};
        m1.map(fn,x);
        expect(fn.alwaysCalledOn(x)).to.be.true;
      });
      it("passes the indices to the function", function () {
        let fn = spy();
        let m1 = new Matrix([[1,2],[3,4]]);
        m1.map(fn);
        expect(fn.withArgs(1,0,0).calledOnce).to.be.true;
        expect(fn.withArgs(4,1,1).calledOnce).to.be.true;
      });
    });
    describe("isSameSizeAs", function () {
      it("returns true if passed matrix matches dimensions", function () {
        let m1 = new Matrix([[1,2,3],[4,5,6]]);
        let m2 = new Matrix([[4,5,6],[7,8,9]]);
        expect(m1.isSameSizeAs(m2)).to.be.true;
      });
    });
    describe("add", function () {
      it("adds two matrices together and returns the result", function () {
        let m1 = new Matrix([[1,2],[3,4]]);
        let m2 = new Matrix([[1,2],[3,4]]);
        let m3 = m1.add(m2);
        expect(m1 === m3).to.be.false;
        expect(m3).to.eql(new Matrix([[2,4],[6,8]]));
      });
    });
    describe("subtract", function () {
      it("subtracts passed matrix from one it's called on and returns the result", function () {
        let m1 = new Matrix([[1,2],[3,4]]);
        let m2 = new Matrix([[1,1],[1,1]]);
        let m3 = m1.subtract(m2);
        expect(m1 === m3).to.be.false;
        expect(m3).to.eql(new Matrix([[0,1],[2,3]]));
      });
    });
    describe("canMultiplyFromLeft", function () {
      it("returns a boolean describing if the matrices can be multiplied", function () {
        let m1 = new Matrix([[1,2],[3,4]]);
        let m2 = new Matrix([[1,1],[1,1]]);
        let m3 = new Matrix([[1,1]]);
        expect(m1.canMultiplyFromLeft(m2)).to.be.true;
        expect(m1.canMultiplyFromLeft(m3)).to.be.false;
      });
    });
    describe("multiply", function () {
      it("returns the product of the two matrices", function () {
        let m1 = new Matrix([[1,1],[2,2]]);
        let m2 = new Matrix([[2,2],[3,3]]);
        expect(m1.multiply(m2)).to.eql(new Matrix([[5,5],[10,10]]));
      });
    });
    describe("inspect", function () {
      it("returns human readable output of the matrix", function () {
        let m1 = new Matrix([[1,2],[3,4]]);
        expect(m1.inspect()).to.equal("1 2\n3 4");
      });
    });
    describe("flatten", function () {
      it("returns elements as a single array", function () {
        let m1 = new Matrix([[1,2],[3,4]]);
        expect(m1.flatten()).to.eql(new Uint16Array([1,2,3,4]));
      });
      it("returns an array that is a Float32Array", function () {
        let m1 = new Matrix([[1,2],[3,4]]);
        expect(m1.flatten()).to.be.instanceof(Float32Array);
        m1 = new Matrix([[.1,.2],[.3,.4]]);
        expect(m1.flatten()).to.be.instanceof(Float32Array);
      });
    });
    describe("transpose", function () {
      it("transposes the matrix", function () {
        let m1 = new Matrix([[1,2],[3,4]]);
        expect(m1.transpose()).to.eql(new Matrix([[1,3],[2,4]]));
      });
    });
  });

  describe("derived properties", function () {
    describe("dimensions", function () {
      it("returns an object with number of rows / columns", function () {
        let m1 = new Matrix([
          [1,2,3],
          [4,5,6]
        ]);
        expect(m1.dimensions).to.eql({
          rows: 2,
          columns: 3
        });
        m1 = new Matrix();
        expect(m1.dimensions).to.eql({
          rows: 0,
          columns: 0
        });
      })
    });
  });

})
