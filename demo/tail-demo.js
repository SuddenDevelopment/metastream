const metastream = require('../index.js');

(function() {

  const TIMEOUT = 30000;
 
  // Initializes the Shodan metastream
  var objStream = new metastream({
    type: "tail",
    path: "/tmp/tail.txt"
  });

  // Starts the Shodan stream. This creates the connection and immediately starts streaming records.
  objStream.go();

  // Stops the stream 60 seconds after it was started.
  setTimeout(function() {
    console.log('Stopping TAIL, 30 seconds after start.');
    objStream.stop();
  }, TIMEOUT);

  setTimeout(function() {
    console.log('Restarting TAIL. This demonstrates that watching picks back up and continues working.');
    objStream.go();
  }, TIMEOUT + 1);
}())
