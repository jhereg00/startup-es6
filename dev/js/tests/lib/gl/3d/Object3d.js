const expect = chai.expect;

describe("Object3d", function () {
	const Object3d = require('lib/gl/3d/Object3d');
	const Positionable = require('lib/gl/3d/Positionable');

	describe("constructor", function () {
		it("gets a uid", function () {
			let obj = new Object3d();
			expect(obj.uid).to.exist.and.not.to.be.null;
		});
		it("extends Positionable", function () {
			let obj = new Object3d();
			expect(obj).to.be.instanceof(Positionable);
		});
		it("may have a name", function () {
			let obj = new Object3d({ name: "foo" });
			expect(obj.name).to.equal("foo");
		});
		it("may have a number of meshes");
		it("may have a number of children", function () {
			let childObj = new Object3d({ name: "hand" });
			let obj = new Object3d({ name: "bigby", children: [childObj] });
			expect(obj.children).to.eql([childObj]);
			expect(childObj.parent).to.equal(obj);
		});
	});

	describe("methods", function () {
		it("can be cloned");
	});

	describe("statics", function () {
		it("can be created from async loaded JSON");
		it("can be retrieved by name", function () {
			let namedObj = new Object3d({ name: "baz" });
			expect(Object3d.getByName("baz")).to.equal(namedObj);
		});
	});
});
