const expect = chai.expect;
const spy = sinon.spy;
const GLTexture2d = require('lib/gl/core/GLTexture2d');

describe('GLTexture2d', function () {
  let canvas, gl, setImageSpy;
  before(function () {
    canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setImageSpy = spy(gl, 'texImage2D');
  });
  beforeEach(function () {
    setImageSpy.reset();
  });

  it("requires gl object be passed", function () {
    function init () {
      return new GLTexture2d('foo');
    }
    expect(init).to.throw(Error, /gl/i);
  });

  it("creates a blank texture in the context", function () {
    let tex = new GLTexture2d(gl, {
      size: 1<<11
    });
    // no native check for final size, so we can only check that the params are as expected
    expect(tex.width).to.equal(1<<11);
    expect(tex.height).to.equal(1<<11);
    expect(tex.image).to.be.null;
  });
  it("creates a texture from an HTMLImageElement if one is passed, waiting for it to load", function (done) {
    let img = new Image ();
    img.src = 'test-data/stormtrooper-petting-wampa.gif';

    let tex = new GLTexture2d(gl, {
      image: img,
      size: 0
    });

    // no native check for final data, so we can only check that the params are as expected
    expect(tex.image).to.be.instanceof(HTMLImageElement);

    img.addEventListener('load', function (e) {
      setTimeout(function () {
        try {
          // console.log(setImageSpy.calledWith(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img), setImageSpy.calledOnce, tex.width === 1024);
          expect(setImageSpy.calledWith(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)).to.be.true;
          expect(setImageSpy.calledOnce).to.be.true;
          expect(tex.width).to.equal(770);
          done();
        } catch (err) {
          console.error('call within timout fn failed');
          done(err);
        }
      }, 50);
    });
  });
  it("creates an HTMLImageElement to make a texture from if a string is passed", function (done) {
    let tex = new GLTexture2d(gl, {
      image: 'test-data/develop-all-the-things.jpg'
    });
    // no native check for final data, so we can only check that the params are as expected
    expect(tex.image).to.be.instanceof(HTMLImageElement);

    tex.image.addEventListener('load', function (e) {
      setTimeout(function () {
        expect(setImageSpy.calledWith(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image)).to.be.true;
        expect(setImageSpy.calledOnce).to.be.true;
        done();
      }, 50);
    });
  });
  it("creates a texture from an HTMLCanvasElement if one is passed", function () {
    let tex = new GLTexture2d(gl, {
      image: canvas
    });
    // no native check for final data, so we can only check that the params are as expected
    expect(tex.image).to.be.instanceof(HTMLCanvasElement);
    expect(setImageSpy.calledWith(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)).to.be.true;
    expect(setImageSpy.calledOnce).to.be.true;
  });
});
