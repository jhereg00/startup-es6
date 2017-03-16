const expect = chai.expect;

describe("AjaxRequest", function () {
	const AjaxRequest = require('lib/util/AjaxRequest');

	it("requires a url property in the passed options", function () {
		let instantiate = function () {
			return new AjaxRequest();
		};
		expect(instantiate).to.throw(Error, /url/);
	});
	it("creates a promise", function () {
		let ar = new AjaxRequest({ url: "foo" });
		expect(ar.promise).to.be.instanceof(Promise);
	});
	it("calls passed functions", function (done) {
		new AjaxRequest({
			url: "foo",
			onError: function (status) {
				expect(status).to.equal(404);
				done();
			}
		});
	});
	describe("Promise behavior", function () {
		before(function () {
			console.log("start promise tests");
		});
		it("uses `#then` as a promise when failing", function (done) {
			let ar = new AjaxRequest({ url: "foo" });
			expect(ar.then).to.exist;
			ar.then(() => {
				done(new Error("Request should not have succeeded. Got status " + ar.xhttp.status));
			}, (status) => {
				expect(status).to.equal(404);
				done();
			});
		});
		it("uses `#then` as a promise when succeeding", function (done) {
			let ar = new AjaxRequest({ url: "test-data/develop-all-the-things.jpg" });
			expect(ar.then).to.exist;
			ar.then((responseText) => {
				expect(responseText).to.not.be.undefined
					.and.not.be.null
					.and.not.to.equal('');
				done();
			}, (status) => {
				done(new Error("Request should not have failed. Got status " + status));
			});
		});
		it("uses `#catch` as a promise", function (done) {
			let ar = new AjaxRequest({ url: "foo" });
			expect(ar.catch).to.exist;
			ar.catch((status) => {
				expect(status).to.equal(404);
				done();
			});
		});
		it("`#then` and `#catch` returns the promise for further chaining", function (done) {
			let ar = new AjaxRequest({ url: "test-data/develop-all-the-things.jpg" });
			let chainTest = false;
			let p = ar.then((responseText) => {
					chainTest = true;
				})
				.then(() => {
					expect(chainTest).to.be.true;
					ar.then(() => {
						chainTest = 2;
					}).then(() => {
						expect(chainTest).to.equal(2);
						done();
					});
				});
			expect(p).to.be.instanceof(Promise);
		});
	});

	it("can be created using a static function", function () {
		expect(AjaxRequest.make({ url: "foo" })).to.be.instanceof(AjaxRequest);
	});
	it("can listen for arbitrary state changes", function (done) {
		let ar = new AjaxRequest({ url: "test-data/develop-all-the-things.jpg" });
		ar.addStateListener(AjaxRequest.readyState.HEADERS_RECEIVED, function (xhttp) {
			expect(xhttp.responseText).to.equal('');
			expect(xhttp.readyState).to.equal(AjaxRequest.readyState.HEADERS_RECEIVED);
			done();
		});
	});

	it("can be aborted", function (done) {
		let stub = sinon.stub();
		let ar = new AjaxRequest({ url: "bar" });
		ar.then(stub, stub);
		ar.abort();
		setTimeout(() => {
			expect(stub.callCount).to.equal(1);
			expect(stub.calledWith(0)).to.be.true;
			expect(ar.xhttp.status).to.equal(0);
			done();
		}, 200);
	});
});
