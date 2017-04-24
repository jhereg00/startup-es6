module.exports = function () {

	const TARGET_FPS = 57; // a few off because of requestAnimationFrame's inconsistency
	const FPS_DELAY = 2000;

	console.clear();

	const Renderer3d = require('lib/gl/3d/Renderer3d');
	const ShaderSource = require('lib/gl/core/ShaderSource');
	const Box = require('lib/gl/3d/primitives/Box');
	const Plane = require('lib/gl/3d/primitives/Plane');
	const Object3d = require('lib/gl/3d/Object3d');
	const Material = require('lib/gl/3d/Material');
	const DirectionalLight = require('lib/gl/3d/DirectionalLight');
	const PointLight = require('lib/gl/3d/PointLight');
	// const PerspectiveCamera = require('lib/gl/3d/PerspectiveCamera');
	// const OrthographicCamera = require('lib/gl/3d/OrthographicCamera');
	// const CubeCamera = require('lib/gl/3d/CubeCamera');
	const Euler = require('lib/math/Euler');

	ShaderSource.setPathPrepend("/glsl/");

	let scene1 = new Renderer3d({
		width: 400,
		height: 400
	});
	scene1.enableWorldSpace();
	scene1.addTo(document.getElementById('canvasContainer'));

	let cam = scene1.activeCamera;
	cam.zFar = 1000;
	cam.moveTo(1, 2, 20);
	cam.lookAt(0, 0, 0);
	// cam.rotateTo(0, Math.PI, 0);

	// let cubeCam = new CubeCamera().moveTo(0, 1, 2);
	// scene1.activeCamera = cubeCam.cameras.zPositive;

	// let boxPile = [];
	// let materials = [
	// 	new Material({
	// 		color: [1, 0, 0, 1]
	// 	}),
	// 	new Material({
	// 		color: [0, .7, 0, 1],
	// 		specularColor: [1, 1, 0, 1],
	// 		specularity: 1.2
	// 	}),
	// 	new Material({
	// 		color: [0, 0, .8, 1],
	// 		specularity: 1
	// 	})
	// ];
	// for (let i = 0; i < 50; i++) {
	// 	let
	// 		w = Math.random(),
	// 		h = Math.random(),
	// 		d = Math.random();
	// 	boxPile.push(
	// 		new Object3d({
	// 			meshes: [
	// 				new Box({
	// 					width: w,
	// 					height: h,
	// 					depth: d,
	// 					material: materials[i % materials.length]
	// 				})
	// 			]
	// 		}).moveTo(
	// 			Math.random() * 4 - Math.random() * 2,
	// 			h / 2,
	// 			Math.random() * 4 - Math.random() * 2
	// 		)
	// 	);
	// }
	// boxPile.push(
	// 	new Object3d({
	// 		meshes: [
	// 			new Box({
	// 				width: 1,
	// 				height: 1,
	// 				depth: 1,
	// 				material: new Material ({
	// 					color: [Math.random() / 2 + .5, Math.random() / 2 + .5, Math.random() / 2 + .5, 1],
	// 					specularity: Math.random()
	// 				})
	// 			})
	// 		]
	// 	}).moveTo(
	// 		1,
	// 		.5,
	// 		0
	// 	)
	// );
	// boxPile.push(
	// 	new Object3d({
	// 		meshes: [
	// 			new Box({
	// 				width: 2,
	// 				height: 2,
	// 				depth: .5,
	// 				material: new Material ({
	// 					color: [Math.random() / 2 + .5, Math.random() / 2 + .5, Math.random() / 2 + .5, 1],
	// 					specularity: 1
	// 				})
	// 			})
	// 		],
	// 	}).moveTo(
	// 		1,
	// 		1,
	// 		-1
	// 	)
	// );
	// boxPile.forEach((box) => scene1.addElement(box));
	let floor = new Object3d({
		meshes: [
			new Plane({
				width: 40,
				depth: 40,
				material: new Material({
					name: 'floor',
					color: [.4, .4, .4, 1],
					specularity: 0
				})
			})
		],
		castsShadows: false
	});
	scene1.addElement(floor);

	// direction indicators
	let hBox = new Box({
		width: .5,
		height: .15,
		depth: .15
	});
	let vBox = new Box({
		width: .15,
		height: .5,
		depth: .15
	});

	let zMat = new Material({color: [0, 0, 1, 1]});
	let yMat = new Material({color: [0, 1, 0, 1]});
	let xMat = new Material({color:	[1, 0, 0, 1]});


	let directionIndicators = {
		zPositive: new Object3d({
			meshes: [hBox, vBox],
			material: zMat
		}).moveTo(0, .5, 5).scaleTo(.5),
		zNegative: new Object3d({
			meshes: [hBox],
			material: zMat
		}).moveTo(0, .5, -5).scaleTo(.5),

		xPositive: new Object3d({
			meshes: [hBox, vBox],
			material: xMat
		}).moveTo(5, .5, 0).scaleTo(.5).rotateBy(0, Math.PI / 2, 0),
		xNegative: new Object3d({
			meshes: [hBox],
			material: xMat
		}).moveTo(-5, .5, 0).scaleTo(.5).rotateBy(0, Math.PI / 2, 0),

		yPositive: new Object3d({
			meshes: [hBox, vBox],
			material: yMat
		}).moveTo(0, 5, 0).scaleTo(.5).rotateBy(Math.PI / 2, 0, 0),
		yNegative: new Object3d({
			meshes: [hBox],
			material: yMat
		}).moveTo(0, -5, 0).scaleTo(.5).rotateBy(Math.PI / 2, 0, 0),
	};

	for (let dir in directionIndicators) {
		scene1.addElement(directionIndicators[dir]);
	}

	let magicBox = new Object3d({
		meshes: [
			new Box({
				width: 1,
				height: 1,
				depth: 1,
				material: new Material({
					color: [0, .4, .9, 1],
					specularity: 1,
					specularColor: [.5, .8, 1, 1]
				})
			})
		]
	}).moveTo(0, 3, 0)
		.setRotationFromEuler(new Euler(Math.PI / 5, 0, Math.PI / 4, "YZX"));
	window.magicBox = magicBox;

	scene1.addElement(magicBox);

	// let walls = [
	// 	new Object3d({
	// 		meshes: [
	// 			new Plane({
	// 				width: 10,
	// 				depth: 10,
	// 				material: 'floor'
	// 			})
	// 		],
	// 		castsShadows: false
	// 	}).setRotationFromEuler(new Euler(0, 0, -Math.PI / 2)).moveTo(-3, 5, 0),
	// 	new Object3d({
	// 		meshes: [
	// 			new Plane({
	// 				width: 10,
	// 				depth: 10,
	// 				material: 'floor'
	// 			})
	// 		],
	// 		castsShadows: false
	// 	}).setRotationFromEuler(new Euler(0, 0, Math.PI / 2)).moveTo(3, 5, 0),
	// 	new Object3d({
	// 		meshes: [
	// 			new Plane({
	// 				width: 10,
	// 				depth: 10,
	// 				material: 'floor'
	// 			})
	// 		],
	// 		castsShadows: false
	// 	}).setRotationFromEuler(new Euler(Math.PI / 2, 0, 0)).moveTo(0, 5, -3)
	// ];
	// walls.forEach((wall) => {
	// 	scene1.addElement(wall);
	// });
	let walls = new Object3d({
		meshes: [
			new Box({
				width: 4,
				height: 4,
				depth: 4,
				material: new Material({
					color: [1, 1, 1, .05],
					specularColor: [1, 1, .75, 1],
					specularity: 1,
					specularExponent: 256
				}),
				// invertNormals: true
			})
		],
		castsShadows: false
	}).moveTo(0, 3, 0);
	scene1.addElement(walls);


	let sunLight = new DirectionalLight({
		direction: [.2, 0, -1],
		ambient: [.1, .1, .16],
		diffuse: [.6, .55, .3],
		specular: [1, .8, .4, 1],
		shadowDistance: 20,
		bias: .1,
		minShadowBlur: 0.5,
		maxShadowBlur: 10,
		shadowResolution: 2048
	});
	// sunLight.shadowCamera.width = 8;
	// sunLight.shadowCamera.height = 8;
	sunLight.moveTo(0, 2, 4);
	sunLight.direction = [0,-2, -4];
	scene1.addElement(sunLight);
	// sunLight.shadowCamera.projectionMatrix;
	// console.log(sunLight.shadowCamera, sunLight.shadowCamera._positionMatrix, sunLight.shadowCamera.mvMatrix, sunLight.shadowCamera._perspectiveMatrix, sunLight.shadowCamera._projectionMatrix);

	let pointLight = new PointLight({
		radius: 10,
		attenuationStart: 4,
		diffuse: [.6, .6, .6, 1],
		maxShadowBlur: 16
	});
	pointLight.moveTo(2, 2, 0);
	scene1.addElement(pointLight);

	var pointLight2 = new PointLight({
		radius: 20,
		attenuationStart: 0,
		diffuse: [0, 0, .8, 1]
	});
	pointLight2.moveTo(-4, 2.5, 0);
	scene1.addElement(pointLight2);

	var pointLight3 = new PointLight({
		radius: 5,
		attenuationStart: 1,
		diffuse: [0, 1, 0, 1],
		diffuseIntensity: 1,
		specular: [.3, 1, .3, 1],
		specularIntensity: 5,
		maxShadowBlur: 2
	});
	pointLight3.moveTo(0, 2, 3);
	setTimeout(() => {
		scene1.addElement(pointLight3);
	}, 4000);

	// scene1.activeCamera = sunLight.shadowCamera;
	window.cam = scene1.activeCamera;
	window.light = sunLight;

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
		cam.moveTo(Math.sin(deltaTime) * 15, 3, Math.cos(deltaTime) * 15);
		cam.lookAt(0, 2, 0);
		// cam.rotateBy(0, Math.PI / 200, 0, 0);
		sunLight.moveTo(Math.sin(deltaTime / 10) * -4, Math.cos(deltaTime / 10) * -4, .5);
		sunLight.direction = [Math.sin(deltaTime / 10) * 4, Math.cos(deltaTime / 10) * 4, -2];
		// sunLight.moveTo(0, Math.sin(deltaTime / 5), Math.cos(deltaTime / 10) * 4 + 4);
		// cam.rotateBy(0, Math.PI / 60, 0);
		magicBox.rotateBy(0, Math.PI / 100, 0);

		// pointLight.moveTo(-2, Math.sin(deltaTime / 3) * 3 + 3, 2);

		scene1.render();

		if (performance.now() > loopStartTime) {
			updateFPSDebug(performance.now() - loopLastTime);
		}
		loopLastTime = performance.now();

		requestAnimationFrame(loop);
	})();
};
