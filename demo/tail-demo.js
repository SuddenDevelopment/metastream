const metastream = require('../index.js');

(function() {

  const TIMEOUT = 30000;
 
  // Initializes the Shodan metastream
  /*
  var objStream = new metastream({
    type: "tail",
    path: "/tmp/tail.txt",
    format: "json"
  });
    var objStream = new metastream({
    type: "tail",
    path: "/tmp/tail.txt",
    format: "delimited",
    pattern: ",",
    fields: ""
  });
  */

  var objStream = new metastream({
    type: "tail",
    path: "/tmp/tail.txt",
    format: "regex",
    pattern: '(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}),(\\d{1,4}) (\\[\\S{1,}\\]) (\\w{1,}) (\\S{1,}):(.{1,})',
    fields: "timestamp,procId,thread,type,class,details"
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
