const expect = chai.expect;
const AjaxRequest = require('lib/AjaxRequest');

describe("AjaxRequest", function () {
  it("requires a url property in the passed options", function () {
    var instantiate = function () {
      return new AjaxRequest();
    }
    expect(instantiate).to.throw(Error, /url/);
  });
  it("should get data", function (done) {
    var req = new AjaxRequest(
      {
        url: "./test.html",
        complete: function (data, xhttp) {
          expect(data).to.have.length.above(0);
          expect(xhttp.status).to.equal(200);
          done();
        }
      }
    );
  });
  it("should fire success function on successful call", function (done) {
    var req = new AjaxRequest(
      {
        url: "./test.html",
        success: function (data, xhttp) {
          expect(data).to.have.length.above(0);
          expect(xhttp.status).to.equal(200);
          done();
        }
      }
    );
  });
  it("should fire error function on failed call", function (done) {
    var req = new AjaxRequest(
      {
        url: "./fail",
        error: function (data, xhttp) {
          expect(xhttp.status).to.not.equal(200);
          done();
        }
      }
    );
  });
  it("should be abortable", function (done) {
    var req = new AjaxRequest(
      {
        url: "./js/tests.raw.js"
      }
    );
    req.abort();
    setTimeout(function () {
      expect(req.getReadyState()).to.not.equal(AjaxRequest.readyState.DONE);
      done();
    },100);
  });
  describe("addStateListener", function () {
    it ("should fire when the request is in the right state", function (done) {
      var req = new AjaxRequest({ url: "./js/tests.raw.js" });
      req.addStateListener(AjaxRequest.readyState.LOADING, function (responseText, xhttp) {
        expect(xhttp.readyState).to.equal(AjaxRequest.readyState.LOADING);
        expect(req.getReadyState()).to.equal(AjaxRequest.readyState.LOADING);
      });
      req.addStateListener(AjaxRequest.readyState.DONE, function (responseText, xhttp) {
        expect(xhttp.readyState).to.equal(AjaxRequest.readyState.DONE);
        expect(req.getReadyState()).to.equal(AjaxRequest.readyState.DONE);
        done();
      });
    });
    it ("should fire immediately if at or past the defined state", function () {
      var unsent = false;
      var done = false;
      var req = new AjaxRequest({ url: "./js/tests.raw.js" });
      req.addStateListener(AjaxRequest.readyState.UNSENT, function () {
        unsent = true;
      });
      req.addStateListener(AjaxRequest.readyState.DONE, function () {
        done = true;
      });
      expect(unsent).to.be.true;
      expect(done).to.be.false;
      req.abort();
    });
    it ("should pass the response text and xhttp object", function (done) {
      var req = new AjaxRequest({ url: "./js/tests.raw.js" });
      req.addStateListener(AjaxRequest.readyState.DONE, function (responseText, xhttp) {
        expect(responseText).to.be.defined;
        expect(responseText).to.equal(req.xhttp.responseText);
        expect(xhttp).to.be.defined;
        expect(xhttp).to.eql(req.xhttp);
        done();
      });
    });
  })
});
