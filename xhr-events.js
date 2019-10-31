'use strict';

(function(document) {

  var xhrEventsResolve;
  document.xhrEventsPromise = new Promise(function(resolve) {
    xhrEventsResolve = resolve;
  });

  var ironRequestInterceptor = function() {
    var ironRequest = document.createElement('iron-request');
    var proto = Object.getPrototypeOf(ironRequest);

    var _send = proto.send;

    proto.send = function() {
      document.dispatchEvent(new CustomEvent('xhr-request', {
        detail: {
          request: this,
          options: arguments[0]
        }
      }));
      return _send.apply(this, arguments);
    };

    var __updateStatus = proto._updateStatus;

    proto._updateStatus = function() {
      __updateStatus.apply(this, arguments);

      var succeeded = this.get('succeeded');
      document.dispatchEvent(new CustomEvent(succeeded ? 'xhr-response' : 'xhr-error', {
        detail: {
          request: this,
          options: arguments[0]
          
        }
      }));
    };
    xhrEventsResolve();
  };

  window.addEventListener('WebComponentsReady', ironRequestInterceptor);

})(document);
