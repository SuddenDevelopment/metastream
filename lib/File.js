var Tail = require('tail').Tail;

var File = function(options) {

  var self = this
    , fileIO = '';

  self.connect = function() {

    if (!options.path) {
      throw 'File - path is required';
    }

    if (fileIO && fileIO.watch) {
      fileIO.watch();
    } else {
      fileIO = new Tail(options.path, {
        follow: true
      });

      fileIO.on('line', function(data) {
        try {
          options.onMessage(JSON.parse(data));
        } catch(err) {
          console.log('Metastream can only handle JSON formatted strings.')
        }
      });

      fileIO.on('error', function(err) {
        console.log('Metastream Tail ERROR: ', err);
      });
    }
  };

  self.close = function() {
    if (fileIO && fileIO.unwatch) {
      fileIO.unwatch();
    }
  };
}

exports.File = File;
