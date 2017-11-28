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
        //console.log(chunk);
        //console.log(chunk.charAt(0),chunk.charAt(chunk.length-1))
        //try to determine if it's a begin , middle or end chunk
        var fBegin=false, fEnd=false;
        if(chunk.charAt(0)==='{'){ fBegin=true; }
        if(chunk.charAt(chunk.length-2)==='}'){ fEnd=true; }
        // msgBuffer will be an empty string to begin with.
        // If an incomplete chunk is sent that triggers a parse error, then this buffer will begin to be built.
        // Once it reaches a parse-able state that succeeds, it will be reset to an empty string.
        if(fBegin===true && fEnd===true){
          //this is a complete record, parse it. move on
          try{ 
            msg = JSON.parse(chunk); 
            //console.log(msg);
            options.onMessage(msg);
          }catch(objError){ 
            //console.log('complete chunk didnt parse',objError,chunk);
          }
          msgBuffer = ''; // Reset the message buffer
        }else if(msgBuffer==='' && fBegin===true && fEnd===false){
          //this is a beginning chunk
          msgBuffer = chunk;
          //console.log('begin chunk found');
        }else if(msgBuffer!=='' && fBegin===false && fEnd===true){
          //this is an ending chunk
          msgBuffer += chunk; 
            var arrStrings = msgBuffer.match(/[^\r\n]+/g);
            //var arrJson =[];
            //console.log(arr.length);
            var fKeepLast=false;
            for(var i=0; i<arrStrings.length; i++){
              try{
                msg = JSON.parse(arrStrings[i]);
                options.onMessage(msg);
              }catch(objError){
                //console.log('end chunk didnt parse',objError,msg);
                if(i == arrStrings.length-1){ fKeepLast=true; }
              }
              //options.onMessage(JSON.parse(arrStrings[i]));
            }
            //msg = JSON.parse(msgBuffer);
            //console.log(msg);
            //options.onMessage(msg);
            msgBuffer = ''; // Reset the message buffer
            if(fKeepLast){ msgBuffer=arrStrings[arrStrings.length-1]; }
          
          //console.log('end chunk found');
        }else if(msgBuffer!==''&& fBegin===false && fEnd===false){
          //this is middle chunk
          msgBuffer += chunk;
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