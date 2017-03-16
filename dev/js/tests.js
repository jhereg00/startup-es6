describe("lib", function () {
	describe("helpers", function () {
		require("tests/lib/helpers/extendObject");
		require("tests/lib/helpers/uid");
	});
	describe("math", function () {
		require("tests/lib/math/Vector");
		// require("tests/lib/math/Vec2");
		// require("tests/lib/math/Vec3");
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
		});
	});
});
