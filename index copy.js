if (typeof window === 'undefined'){var utils = require('suddenutils'); var _ = new utils();
var metastream = function(objConfig){
	//----====|| LOGIC ||====----\\
	//clean input vars
		//requesting a lib that exists
		//necessary params supplied
		//apply defaults
	//decide which lib is used to send back normalized functions
	//send error with the lib does not have the proper supporting files loaded

	//----====|| PUSHER ||====----\\
	objSource.pusher={
	  // https://pusher.com/docs/client_api_guide
	   go: function(objSrc){
	    $scope.objFeed[objSrc.name] = new Pusher( objSrc.addr );
	      //subscribe to all channels defined
	      _.for(objSrc.channels,function(v,k){
	        $scope.objFeed[objSrc.name].subscribe(v);
	      });
	      //subscribe to all events defined
	      _.for(objSrc.events,function(v,k){
	        $scope.objFeed[objSrc.name].bind(v,function(objData){ fnFieldMaps(objSrc,objData); });
	      });
	      $scope.objFeed[objSrc.name].connection.bind('disconnected',function(){ objSrc.state='stopped'; });
	   }
	  ,stop: function(objSrc){ $scope.objFeed[objSrc.name].disconnect(); }
	};
	//----====|| PUBNUB ||====----\\
	objSource.pubnub={
	   // https://www.pubnub.com/docs/web-javascript/api-reference
	   go: function(objSource){
	    if(typeof PUBNUB !== 'undefined'){
	      $scope.objFeed[objSource.name] = PUBNUB.init({subscribe_key:objSource.addr});
	      _.for(objSource.channels,function(v,k){
	        $scope.objFeed[objSource.name].subscribe({channel:v,message:function(objData){ fnFieldMaps(objSource,objData); }});
	      });
	    }
	   }
	  ,stop: function(objSource){ 
	    _.for(objSource.channels,function(v,k){
	        $scope.objFeed[objSource.name].unsubscribe({channel:v,message:function(objData){ fnFieldMaps(objSource,objData); }});
	      });
	  }
	};
	//----====|| WEBSOCKET ||====----\\
	objSource.websocket={
	   go: function(objSrc){
	    $scope.objFeed[objSrc.name] = new WebSocket(objSrc.addr);
	      $scope.objFeed[objSrc.name].onopen=function(){
	        if(objSrc.sendOnConnect && objSrc.sendOnConnect !== ''){
	          $scope.objFeed[objSrc.name].send(objSrc.sendOnConnect);
	        } 
	      };
	      $scope.objFeed[objSrc.name].onmessage=function(objData){ 
	        fnFieldMaps(objSrc,JSON.parse(objData.data));
	      };
	      $scope.objFeed[objSrc.name].onerror=function(strError){ objSrc.state='error: '+strError; };
	      $scope.objFeed[objSrc.name].onclose=function(strError){ objSrc.state='stopped'; };
	   }
	  ,stop: function(objSrc){ $scope.objFeed[objSrc.name].close(); }
	};
	//----====|| SOCKSJS ||====----\\
	objSource.sockjs={
	  //https://github.com/sockjs/sockjs-client
	   go: function(objSrc){
	    $scope.objFeed[objSrc.name] = new SockJS(objSrc.addr);
	       $scope.objFeed[objSrc.name].onopen = function() {
	           if(objSrc.sendOnConnect && objSrc.sendOnConnect !== ''){
	          $scope.objFeed[objSrc.name].send(objSrc.sendOnConnect);
	        } 
	       };
	      $scope.objFeed[objSrc.name].onerror=function(strError){ objSrc.state='error: '+strError; };
	      $scope.objFeed[objSrc.name].onclose=function(strError){ objSrc.state='stopped'; };
	    $scope.objFeed[objSrc.name].onmessage = function(objData) { fnFieldMaps(objSrc,JSON.parse(objData.data)); };
	   }
	  ,stop: function(objSrc){ $scope.objFeed[objSrc.name].close(); }
	};
	//----====|| SOCKETIO ||====----\\
	objSource.socketio={
	   go: function(objSource){
	    $scope.objFeed[objSource.name] = io.connect(objSource.addr,{reconnect:true});
	      $scope.objFeed[objSource.name].on('connect', function() { 
	        if(objSource.hasOwnProperty('channels') && objSource.channels.length > 0){
	          _.for(objSource.channels,function(v,k){
	            $scope.objFeed[objSource.name].emit('subscribe', v);
	          });
	        }else{ $scope.objFeed[objSource.name].emit('subscribe', '*'); }
	      });
	      //add subscriptions to channels, handle the events
	      $scope.objFeed[objSource.name].on('change', function(objData) { fnFieldMaps(objSource,objData); });
	      $scope.objFeed[objSource.name].on('reconnect', function(objData) { $scope.notifications.push('reconnecting: ' + objSource.name); });
	   }
	  ,stop: function(objSource){ 
	    //socket.io changed a lot through versions
	    $scope.objFeed[objSource.name].emit('unsubscribe', '*');
	    if(typeof $scope.objFeed[objSource.name].disconnect() !== undefined){ $scope.objFeed[objSource.name].disconnect(); }
	    else if(typeof $scope.objFeed[objSource.name].close() !== undefined){ $scope.objFeed[objSource.name].close(); }
	  }
	};
	//----====|| API POLLING ||====----\\
	objSource.api={
	  go: function(objSource){
	    var objConfig=objSource.api;
	    if(!objConfig.hasOwnProperty('url') || objConfig.url===''){objConfig.url=objSource.addr;}
	    objConfig.fnCall=function(){ 
	      

	      var objHeaders={'Content-Type':'text/plain'};
	      if(!objConfig.hasOwnProperty('col')){objConfig.col=objData._column+'.api';}
	      if(objConfig.hasOwnProperty('headers') && objConfig.headers.length > 0){ 
	        _.for(objConfig.headers,function(v,k){
	          objHeaders[k]=v;
	        });
	      }
	      //translate all of the item data into parameters for the API call
	      var objAPIData={};
	      if(objConfig.hasOwnProperty('data') && objConfig.data.length > 1){
	        _.for(objConfig.data,function(v,k){
	          //if(!v.hasOwnProperty('dstKey') && v.hasOwnProperty('srcPath')){v.dstKey=v.srcPath;}
	          if(v.hasOwnProperty(value) && v.value !== ''){ objAPIData[v.dstKey]=v.val; }
	          else{ objAPIData[v.dstKey]=_.get(objData,v.srcPath); }
	        });
	      }
	      $http({
	        method: objConfig.method
	        ,url: objConfig.url
	        ,headers: objHeaders
	        ,data: objAPIData
	      }).then(function(response){ $scope.objFeed[objSource.name].process(response.data.data); });
	      
	      //return 'stuff\nandmorestuff\nandjunk';
	    };
	    objConfig.fnEvent=function(objData){
	      objData._column=objSource.api.col;
	      fnFieldMaps(objSource,objData);
	    };
	    $scope.objFeed[objSource.name]=new api2stream(objConfig);
	    $scope.objFeed[objSource.name].fnFirstResults();
	  }
	  ,stop: function(objSource){ $scope.objFeed[objSource.name].fnStop(); }
	}
	//----====|| CSV PAPAPARSE ||====----\\
}

if (typeof module !== 'undefined' && module.exports){module.exports = metastream;}