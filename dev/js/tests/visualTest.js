module.exports = function () {

	const Renderer3d = require('lib/gl/3d/Renderer3d');
	const ShaderSource = require('lib/gl/core/ShaderSource');

	ShaderSource.setPathPrepend("/glsl/");

	let scene1 = new Renderer3d();
	scene1.enableWorldSpace();
	scene1.addTo(document.getElementById('canvasContainer'));

	scene1.render();

};
