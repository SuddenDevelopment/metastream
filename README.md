# metastream
abstraction library to normalize data streaming types and give them a common interface

todo:

1. abstract out of ohm.ai
2. add api polling from api2stream lib
3. add webrtc: http://peerjs.com/

Pass in a config
get back an object to control the stream;

```javascript

//set config
 var objConfig={ 
     type:'websocket'
    ,addr:'wss://ws.blockchain.info/inv'
    ,sendOnConnect:'{"op":"unconfirmed_sub"}'
    ,channels:['pubnub-twitter']
    ,fnResults=function(results){ console.log(results); }
  }
  
  //instantiate
  var objStream = new metaStream(objConfig);
  
  // go
  objStream.go();
  
  // stop
  objStream.stop();

```
