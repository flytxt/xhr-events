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

    var request;

    it('should fire the request event', function() {
      var pass = fixture('pass');
      request = pass.generateRequest();

      expect(xhrSpy).to.be.calledOnce;
      expect(eventSpy).to.be.calledOnce;

      var customEvent = eventSpy.getCall(0).args[0];
      expect(customEvent).to.be.an('CustomEvent');
      expect(customEvent.type).to.be.equal('xhr-request');
      expect(customEvent.detail.request).to.be.an('HTMLElement');
      expect(customEvent.detail.options).to.be.an('Object');
      expect(customEvent.detail.options.url).to.be.equal('/pass');
    });

    it('should fire the response event', function(done) {
      request.completes.then(function() {
        try {
          expect(eventSpy).to.be.calledOnce;

          var customEvent = eventSpy.getCall(0).args[0];
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

    var request;

    it('should fire the request event', function() {
      var fail = fixture('fail');
      request = fail.generateRequest();

      expect(xhrSpy).to.be.calledOnce;
      expect(eventSpy).to.be.calledOnce;

      var customEvent = eventSpy.getCall(0).args[0];
      expect(customEvent).to.be.an('CustomEvent');
      expect(customEvent.type).to.be.equal('xhr-request');
      expect(customEvent.detail.request).to.be.an('HTMLElement');
      expect(customEvent.detail.options).to.be.an('Object');
      expect(customEvent.detail.options.url).to.be.equal('/fail');
    });

    it('should fire the error event', function(done) {
      request.completes['catch'](function() {
        try {
          expect(eventSpy).to.be.calledOnce;

          var customEvent = eventSpy.getCall(0).args[0];
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
