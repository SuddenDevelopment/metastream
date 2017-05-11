# metastream
abstraction library to normalize data streaming types and give them a common interface

supported streaming:
1. websocket
2. pubnub
3. socket.io
4. pusher
5. sock.js
6. http json stream

adapted streaming
1. api polling
2. csv stream

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
    ,fReconnect=true
  }
  
  //instantiate
  var objStream = new metaStream(objConfig);
  
  // go
  objStream.go();
  
  // stop
  objStream.stop();

```
