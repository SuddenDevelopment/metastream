var HTTP = require('http')
  , HTTPS = require('https')

var Shodan = function(options) {

  var self = this
    , protocolHandler = null
    , httpRequest = null;

  self.connect = function() {

    if (!options.url) {
      throw 'Shodan - url is required';
    } else if (!options.appKey) {
      throw 'Shodan - appKey is required';
    }

    var protocol = options.url.split('://')[0];

    if ('http' === protocol) {
      protocolHandler = HTTP;
    } else if ('https' === protocol) {
      protocolHandler = HTTPS;
    } else {
      throw 'Unrecognized protocol: ' + protocol;
    }

    httpRequest = protocolHandler.get(options.url + '?key=' + options.appKey, function(res) {
      // This is the only handler defined, because none of the other handlers like "on.error" or "on.end"
      // get called due to the way that the Shodan streaming API works.
      res.on('data', function(chunk) {
        options.onMessage(chunk.toString('utf8'))
      });
    });
  };

  self.close = function() {
    if (httpRequest && httpRequest.abort) {
      httpRequest.abort()
    }
  };
}
exports.Shodan = Shodan;