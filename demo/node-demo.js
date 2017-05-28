//get the metastream lib
const metastream = require('../index.js');

var intCounter=10;
var objStream={};
//set a config
var objConfig={"type":'ws',"addr":'wss://ws.blockchain.info/inv',"sendOnConnect":'{"op":"unconfirmed_sub"}'};
objConfig.fnResults=function(objMsg){ 
	intCounter--;
	console.log('ws: ',objMsg);
	if(intCounter===0){ objStream.stop(); }
};
var objStream = new metastream(objConfig);
//go for at least 10 messages
objStream.go();

//stop, disconnect, go to the next source