//get the metastream lib
const metastream = require('../index.js');

var intCounter=10;
var objStream={};
var objSources={};
//set a config
var objConfig={"type":'ws',"addr":'wss://ws.blockchain.info/inv',"sendOnConnect":'{"op":"unconfirmed_sub"}'};
objConfig.fnResults=function(objMsg){ 
	intCounter--;
	console.log('ws: ',objMsg);
	if(intCounter===0){ 
		objStream.stop();
		objSources.hpfeed();
	}
};
var objStream = new metastream(objConfig);
//go for at least 10 messages
objStream.go();

//stop, disconnect, go to the next source
objSources.hpfeed=function(){
	intCounter=10;
	var objConfig={"type":'hpfeed',"addr":'mhn.threatstream.com',"port":10000,"un":'pub_sub',"pw":'d26a317ed7887971c17983160a5819412aead879', "channel":'amun.events,beeswarm.hive,beeswarn.feeder,conpot.events,cuckoo.analysis,dionaea.capture,dionaea.connections,elastichoney.events,geoloc.events,glastopf.events,glastopf.files,kippo.sessions,mwbinary.dionaea.sensorunique,p0f.events,shockpot.events,snort.alerts,thug.events,thug.files,wordpot.events'};
	objConfig.fnResults=function(objMsg){ 
		intCounter--;
		console.log('hpfeed: ',intCounter ,objMsg);
		if(intCounter<1){ 
			objStream.stop(); 
		}
	};
	var objStream = new metastream(objConfig);
	//go for at least 10 messages
	objStream.go();
}