const metastream = require('../index.js');

(function() {
 
  // Initializes the Shodan metastream
  var objStream = new metastream({
    type: "file", 
    path: "/tmp/tail.txt"
  });

  // Starts the Shodan stream. This creates the connection and immediately starts streaming records.
  objStream.go();

  // Stops the stream 60 seconds after it was started.
  setTimeout(function() {
    console.log('Stopping TAIL, 2 minutes after start. If you don\'t want this limitation, then delete the setTimeout call in demo/tail-demo.js');
    objStream.stop();
  }, 120000);
}())
