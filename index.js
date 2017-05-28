//I need a way to include the node libs only when on node and needed, cleanly
var ws={};
var hpc={};

if(typeof module==='object'){
	console.log('on node');
	ws=require('ws');
	hpc=require('./lib/HPC.js').HPC;
};

var metastream = function(objConfig){
	'use strict';
	//----====|| REQUIREMENTS ||====----\\
	/*
		1. abstract streaming protocols and methods so tools can be applied across data from all of them
		2. Config (with channels), Connect,Sendonconnect, reconnect, go, stop, onResults, send (when available)
		3. This is the browser version. browser and node versions are separate but share common properties and methods
	*/
	//----====|| LOGIC ||====----\\
	//clean input vars
		//requesting a lib that exists
		//necessary params supplied
		//apply defaults
	//decide which lib is used to send back normalized functions
	//send error with the lib does not have the proper supporting files loaded
	/*
	 var objConfig={ 
	     type:'websocket'
	    ,addr:'wss://ws.blockchain.info/inv'
	    ,sendOnConnect:'{"op":"unconfirmed_sub"}'
	    ,channels:['pubnub-twitter']
	    ,fnResults=function(results){ console.log(results); }
	    ,fReconnect=true
	  }
	*/
	//keep a list of allowed protocols and their defaults
	this.objProtocols={
		 "websocket":{}
		,"satori":{}
		,"ipc":{}
	};
	this.type=objConfig.type;
	this.addr='ws://localhost:8080';
	this.objConfig=objConfig;

	if(typeof objConfig.id !== 'undefined'){ this.id=objConfig.id; }
	if(typeof this.objProtocols[objConfig.type] !== 'undefined'){ this.type=objConfig.type; }
	if(typeof objConfig.addr !== 'undefined'){ this.addr=objConfig.addr; }
	if(typeof objConfig.fnResults !== 'undefined'){ this.fnResults=objConfig.fnResults; }
	   else{ this.fnResults=function(objMessage){ console.log(objMessage); } }

	//hold the object that is returned by whatever protocol we are running in this instance
	this.objProtocol={};
	//keep the status for easy reference, connecting, connected, disconnected, streaming, error
	this.state='disconnected';
	//check if the pre-requisite libraries can be found for the protocol selected, need to load pubnub before using pubnub in this lib
	if (typeof module !== 'undefined'){ this.mode='node'; }else{ this.mode='browser'; }
	var self=this;
	this.go=function(){
		//because these are dynamically called, each abstratced lib needs to have the same numer of params for each function  
	  //detect if connected, connect if not
	  if(self.state==='disconnected'){ self[self.type].connect(); }
	  self[self.type].go();
	};
	this.stop=function(){ self[self.type].stop(); };
	this.send=function(){ self[self.type].send(); };

	//----====|| websocket||====----\\
	this.websocket={
	   connect: function(){
	   	  self.objProtocol = new WebSocket(self.addr);
	   	  self.state='connecting';
	   	  //send first message if configured, sometimes used for auth or subscribtions
	   	  self.objProtocol.onopen=function(){
	   	  	self.state='connected';
	   	  	if(typeof self.objConfig.sendOnConnect !== 'undefined'){this.send(self.objConfig.sendOnConnect);}
	   	  } 
	   },go: function(){
	      self.objProtocol.onmessage=this.onMsg;
	      self.objProtocol.onerror=this.onErr;
	      self.objProtocol.onclose=function(){
	      	self.state='disconnected';
	      	if(typeof self.objConfig.fnClose !== 'undefined'){this.fnClose;}
	      	//reconnect if the close wasnt intentional
	      };
	   },stop: function(){ 
	   	  self.objProtocol.close(); 
	   },send:function(objMessage,strChannel){
	   	  self.objProtocol.send(objMessage);
	   },onMsg:function(objMsg){
	   	  self.state='streaming';
	   	  self.fnResults(objMsg,self.objConfig);
	   },onErr:function(objErr){ console.log(objErr); }
	};
	//----====|| ws client on node||====----\\
	this.ws={
	   connect: function(){
	   	  self.objProtocol = new ws(self.addr);
	   	  self.state='connecting';
	   	  //send first message if configured, sometimes used for auth or subscribtions
		  self.objProtocol.on('open', function(){
			self.state='connected';
			if(typeof self.objConfig.sendOnConnect !== 'undefined'){this.send(self.objConfig.sendOnConnect);}
		  });
	   },go: function(){
	      self.objProtocol.on('message',this.onMsg);
	      self.objProtocol.on('error',this.onErr);
	      self.objProtocol.on('close',function(){
	      	self.state='disconnected';
	      	//reconnect if the close wasnt intentional
	      });
	   },stop: function(){ 
	   	  self.objProtocol.close(); 
	   },send:function(objMessage,strChannel){
	   	  self.objProtocol.send(objMessage);
	   },onMsg:function(objMsg){
	   	  self.state='streaming';
	   	  self.fnResults(objMsg,self.objConfig);
	   },onErr:function(objErr){ console.log(objErr); }
	};
	//----====|| satori ||====----\\
	this.satori={
	   "features":{ "browser":true }
	   ,connect: function(){
        self.state='connecting';

        self.objProtocol = new RTM(self.addr, self.objConfig.appKey);

        self.objProtocol.on('leave-connected', function() {
          self.state='disconnected';
        });

        self.objProtocol.on('enter-connected', function() {
          self.state='connected';
        });

        var subscription = self.objProtocol.subscribe(self.objConfig.channel, RTM.SubscriptionMode.SIMPLE);
        subscription.on('rtm/subscription/data', function (pdu) {
          pdu.body.messages.forEach(function (msg) {
            self.satori.onMsg({
              data: msg // IMPORTANT: doesn't work unless the message is encapsulated in a 'data' parameter
            })
          });
        });

	   },go: function(objSrc){
        self.objProtocol.start()
      },stop: function(objSrc){
        if (self.objProtocol.stop) {
          self.objProtocol.stop()
        }
      },send:function(objMessage,strChannel){
        strChannel = strChannel || objConfig.channel;
        self.objProtocol.publish(strChannel, objMessage, function(res) {
          if (!res.action.endsWith('/ok')) {
            console.log('Satori - SEND FAILED');
          }
        });
      },onMsg:function(objMsg){
        self.state='streaming';
        self.fnResults(objMsg,objConfig);
      },onErr:function(objErr){ console.log(objErr); }
	};
	//----====|| pubnub ||====----\\
	//----====|| pusher ||====----\\
	//----====|| socket.io ||====----\\
	//----====|| sockjs ||====----\\
	//----====|| json stream node ||====----\\
	//----====|| signalr, no jquery ||====----\\
	//----====|| hpfeeds node ||====----\\
	this.hpfeed={
		/*
			https://github.com/SuddenDevelopment/node-hpfeeds
		*/
		connect: function(){
	   	  self.objProtocol = new hpc(
	   	  	 self.objConfig.addr
	   	  	,self.objConfig.port
	   	  	,self.objConfig.un
	   	  	,self.objConfig.pw
	   	  	,self.objConfig.channel
	   	  	,this.onMsg
	   	  );
	   	  self.state='connecting';
	   	  //send first message if configured, sometimes used for auth or subscribtions
	   },go: function(){
	      self.objProtocol.connect();
	   },stop: function(){
	   	  self.objProtocol.close();
	   },onMsg:function(strChannel,objMsg){
	   	  objMsg.channel=strChannel;
	   	  self.state='streaming';
	   	  self.fnResults(objMsg,objConfig);
	   },onErr:function(objErr){ console.log(objErr); }
	};
	//----====|| electron IPC ||====----\\
	this.ipc={
		/*
			//IPC is primarily for use in Electron, it can allow the node components to get the data and this just proxies the commands
			// In renderer process (web page).  https://github.com/electron/electron/blob/master/docs/api/ipc-main.md
		*/
	    connect: function(){ 
	    	if(typeof self.objProtocol === 'undefined'){ self.objProtocol = require('electron'); }
	    	ipc.send({"action":'connect',"config":self.objConfig});
	   },go:function(objSrc){ 
	   		ipc.send({"action":'go',"config":self.objConfig});
	   	}
	   ,stop:function(objSrc){ ipc.send({"action":'stop',"config":self.objConfig}); }
	   ,send:function(objMessage,strChannel){ ipc.send({"action":'send',"config":self.objConfig,"data":{"msg":objMessage,"chan":strChannel}}); }
	   ,onMsg:function(objMsg){
	   	  self.state='streaming';
	   	  self.fnResults(objMsg,objConfig);
	   }
	};
}
//this is for node to be able to "require" it. node may need different pre-requisite libraries, not all protocols work work in node and nto all will work in browser
if (typeof module !== 'undefined' && module.exports){module.exports = metastream;}