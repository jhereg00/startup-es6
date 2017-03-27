const expect = chai.expect;

describe("Mesh", function () {
	const Mesh = require('lib/gl/3d/Mesh');
	
	it("ensures it has as many UVs and Normals as Positions", function () {
		let mesh = new Mesh({
			positions: [
				0, 0, 0,
				1, 0, 0,
				0, 1, 0
			]
		});
		expect(mesh.vertexCount).to.equal(3);
		expect(mesh.uvs.length).to.equal(6);
		expect(mesh.normals.length).to.equal(9);
	});
	it("can be retrieved by name", function () {
		let mesh = new Mesh({
			name: "flatTri",
			positions: [
				0, 0, 0,
				1, 0, 0,
				0, 1, 0
			]
		});
		expect(Mesh.getByName("flatTri")).to.equal(mesh);
	});
	it("has a uid", function () {
		let mesh = new Mesh({
			positions: [
				0, 0, 0,
				1, 0, 0,
				0, 1, 0
			]
		});
		expect(mesh.uid).to.exist;
	});
});
