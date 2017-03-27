module.exports = function () {

	const TARGET_FPS = 57; // a few off because of requestAnimationFrame's inconsistency
	const FPS_DELAY = 2000;

	console.clear();

	const Renderer3d = require('lib/gl/3d/Renderer3d');
	const ShaderSource = require('lib/gl/core/ShaderSource');
	const Box = require('lib/gl/3d/primitives/Box');
	const Object3d = require('lib/gl/3d/Object3d');
	// const PerspectiveCamera = require('lib/gl/3d/PerspectiveCamera');

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

	let boxPile = [];
	for (let i = 0; i < 10; i++) {
		boxPile.push(
			new Object3d({
				meshes: [
					new Box({
						width: Math.random(),
						height: Math.random(),
						depth: Math.random()
					})
				]
			}).moveTo(
				Math.random() * 4 - Math.random() * 2,
				0,
				Math.random() * 4 - Math.random() * 2
			)
		);
	}
	boxPile.forEach((box) => scene1.addElement(box));

	scene1.render();

	// fps tracker
	let debug = document.getElementById('debug');
	let updateFPSDebug = function (deltaTime) {
		fps.last = 1000 / deltaTime;
		fps.count++;
		let totalTime = performance.now() - loopStartTime;
		fps.average = 1000 / (totalTime / fps.count);
		fps.peak = Math.max(fps.peak, fps.last);
		fps.valley = Math.min(fps.valley, fps.last);

		if (fps.last < TARGET_FPS)
			fps.timeUnderTarget += deltaTime;

		debug.innerHTML = `
			<table>
				<tr><th>Average FPS:</th><td>${fps.average}</td></tr>
				<tr><th>Peak FPS:</th><td>${fps.peak}</td></tr>
				<tr><th>Low FPS:</th><td>${fps.valley}</td></tr>
				<tr><th>Now FPS:</th><td>${fps.last}</td></tr>
				<tr><th>% time under ${TARGET_FPS} FPS:</th><td>${Math.round(fps.timeUnderTarget / totalTime * 10000) / 100}%</td></tr>
			</table>
		`;
	};
	let fps = {
		peak: 0,
		valley: 9999,
		average: 0,
		count: 0,
		last: 0,
		timeUnderTarget: 0
	};
	let loopStartTime = performance.now() + FPS_DELAY;
	let loopLastTime = performance.now();

	let startTime = performance.now();
	(function loop () {
		let deltaTime = (performance.now() - startTime) / 1000;
		cam.moveTo(Math.sin(deltaTime) * 3, -1, Math.cos(deltaTime) * 3);
		cam.lookAt(0, 0, 0);
		scene1.render();

		if (performance.now() > loopStartTime) {
			updateFPSDebug(performance.now() - loopLastTime);
		}
		loopLastTime = performance.now();

		requestAnimationFrame(loop);
	})();
};
