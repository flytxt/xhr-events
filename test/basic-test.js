/* jshint expr: true */
/* globals fixture */
describe('xhr-events', function() {

  var server;
  var xhrSpy;
  var eventSpy;

  before(function() {
    server = sinon.fakeServer.create({
      autoRespond: true
    });

    server.respondWith('GET', '/pass', [200, {}, '{}']);

    server.respondWith('GET', '/fail', [401, {}, '{}']);

    xhrSpy = sinon.spy(server, 'handleRequest');

    eventSpy = sinon.spy();

    document.addEventListener('xhr-request', eventSpy);
    document.addEventListener('xhr-response', eventSpy);
    document.addEventListener('xhr-error', eventSpy);
  });

  afterEach(function() {
    xhrSpy.reset();
    eventSpy.reset();
  });

  describe('when requesting URI that will pass', function() {

    it('should fire the request and response event', function(done) {
      var pass = fixture('pass');
      var request = pass.generateRequest();

      request.completes.then(function() {
        try {
          expect(xhrSpy).to.be.calledOnce;
          expect(eventSpy).to.be.calledTwice;

          var customEvent = eventSpy.getCall(0).args[0];
          expect(customEvent).to.be.an('CustomEvent');
          expect(customEvent.type).to.be.equal('xhr-request');
          expect(customEvent.detail.request).to.be.an('HTMLElement');
          expect(customEvent.detail.options).to.be.an('Object');
          expect(customEvent.detail.options.url).to.be.equal('/pass');

          customEvent = eventSpy.getCall(1).args[0];
          expect(customEvent).to.be.an('CustomEvent');
          expect(customEvent.type).to.be.equal('xhr-response');
          expect(customEvent.detail.request).to.be.an('HTMLElement');
          expect(customEvent.detail.request.status).to.be.equal(200);
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  describe('when requesting URI that will fail', function() {

    it('should fire the request and error event', function(done) {
      var fail = fixture('fail');
      var request = fail.generateRequest();

      request.completes['catch'](function() {
        try {
          expect(xhrSpy).to.be.calledOnce;
          expect(eventSpy).to.be.calledTwice;

          var customEvent = eventSpy.getCall(0).args[0];
          expect(customEvent).to.be.an('CustomEvent');
          expect(customEvent.type).to.be.equal('xhr-request');
          expect(customEvent.detail.request).to.be.an('HTMLElement');
          expect(customEvent.detail.options).to.be.an('Object');
          expect(customEvent.detail.options.url).to.be.equal('/fail');

          customEvent = eventSpy.getCall(1).args[0];
          expect(customEvent).to.be.an('CustomEvent');
          expect(customEvent.type).to.be.equal('xhr-error');
          expect(customEvent.detail.request).to.be.an('HTMLElement');
          expect(customEvent.detail.request.status).to.be.equal(401);
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  after(function() {
    server.restore();
  });

});
