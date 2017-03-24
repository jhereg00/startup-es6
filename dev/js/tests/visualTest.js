module.exports = function () {

	console.clear();

	const Renderer3d = require('lib/gl/3d/Renderer3d');
	const ShaderSource = require('lib/gl/core/ShaderSource');
	const PerspectiveCamera = require('lib/gl/3d/PerspectiveCamera');

	ShaderSource.setPathPrepend("/glsl/");

	let scene1 = new Renderer3d({
		width: 400,
		height: 400
	});
	scene1.enableWorldSpace();
	scene1.addTo(document.getElementById('canvasContainer'));

	let cam = scene1.activeCamera;
	cam.zFar = 1000;
	cam.moveTo(0, 1, -2);
	cam.lookAt(0, 0, 0);

	scene1.render();

	let startTime = performance.now();
	(function loop () {
		let deltaTime = (performance.now() - startTime) / 1000;
		cam.moveTo(Math.sin(deltaTime) + 2, 1, Math.sin(deltaTime / 5) * 5);
		cam.lookAt(0, 0, 0);
		scene1.render();

		requestAnimationFrame(loop);
	})();
};
