describe("lib", function () {
  describe("helpers", function () {
    require("tests/lib/helpers/extendObject");
  });
  describe("math", function () {
    require("tests/lib/math/Vector");
    // require("tests/lib/math/Vec2");
    // require("tests/lib/math/Vec3");
    require("tests/lib/math/Quaternion");
  });
  describe("gl", function () {
    describe("core", function () {
      require("tests/lib/gl/core/Renderer");
    });
  });
});
