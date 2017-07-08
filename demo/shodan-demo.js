const metastream = require('../index.js');

(function() {
 
  // Initializes the Shodan metastream
  var objStream = new metastream({
    type: "shodan", 
    channel: "banners",
    addr: "https://stream.shodan.io/shodan/banners",
    appKey: "0ZM3HtWOz5qGkQPZL8SjSuaj7IIearmT",
    fnResults: function(objMsg){
      console.log('.');
    }
  });

  // Starts the Shodan stream. This creates the connection and immediately starts streaming records.
  objStream.go();

  // Stops the stream after 5 seconds.
  setTimeout(function() {
    console.log('Stopping SHODAN 5 seconds after initial start.');
    objStream.stop();
  }, 5000);

  // Restarts the stream 1 second after it was stopped.
  setTimeout(function() {
    console.log('Restarting SHODAN 1 second after last stop.');
    objStream.go();
  }, 6000);

  // Stops the stream 4 seconds after it was restarted.
  setTimeout(function() {
    console.log('Stopping SHODAN for the final time, 4 seconds after last restart.');
    objStream.stop();
  }, 10000);
}())
