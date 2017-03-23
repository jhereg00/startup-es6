describe("lib", function () {
	describe("helpers", function () {
		require("tests/lib/helpers/extendObject");
		require("tests/lib/helpers/uid");
	});
	describe("math", function () {
		require("tests/lib/math/Vector");
		// require("tests/lib/math/Vec2");
		// require("tests/lib/math/Vec3");
		require("tests/lib/math/Matrix4");
		require("tests/lib/math/Euler");
		require("tests/lib/math/Quaternion");
	});
	describe("util", function () {
		require("tests/lib/util/AjaxRequest");
	});
	describe("gl", function () {
		describe("core", function () {
			require("tests/lib/gl/core/Renderer");
			require("tests/lib/gl/core/InstancedProperties");
			require("tests/lib/gl/core/GLBuffer");
			require("tests/lib/gl/core/ShaderSource");
			require("tests/lib/gl/core/GLProgram");
			require("tests/lib/gl/core/GLTexture2d");
			require("tests/lib/gl/core/GLFramebuffer");
		});
		describe("3d", function () {
			require("tests/lib/gl/3d/Renderer3d");
			require("tests/lib/gl/3d/Positionable");
		});
	});
});

after(require("tests/visualTest"));
