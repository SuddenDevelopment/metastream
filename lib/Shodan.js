var HTTP = require('http')
  , HTTPS = require('https')

var Shodan = function(options) {

  var self = this
    , protocolHandler = null
    , httpRequest = null
    , msgBuffer = '';

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
        var msg;

        chunk = chunk.toString('utf8');
        // msgBuffer will be an empty string to begin with.
        // If an incomplete chunk is sent that triggers a parse error, then this buffer will begin to be built.
        // Once it reaches a parse-able state that succeeds, it will be reset to an empty string.
        msgBuffer += chunk;

        try {
          msg = JSON.parse(msgBuffer)
          msgBuffer = ''; // Reset the message buffer
          options.onMessage(msg)
        } catch(err1) {

          // If the combination of new buffer (chunk) + backlog buffer (msgBuffer) doesn't work,
          // then we try to just parse the latest chunk.
          // If it works, then we chalk it all up to Shodan weirdness, and move forward with the atomic JSON object.
          try {
            msg = JSON.parse(chunk)
            msgBuffer = ''; // Reset the message buffer
            options.onMessage(msg)
          } catch(err2) {
            // If it doesn't work to parse the chunk in isolation, then continue as though it's just adding to the backlog buffer (msgBuffer)
            msgBuffer += chunk;
          }
        }
      });
    });
  };

  self.close = function() {
    if (httpRequest && httpRequest.abort) {
      httpRequest.abort()
    }
    // Flush the message buffer, just in case
    msgBuffer = '';
  };
}
exports.Shodan = Shodan;