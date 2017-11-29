var Tail = require('tail').Tail;

var FileTail = function(options) {

  var self = this
    , fileIO = '';

  self.connect = function() {
    console.log(options);
    if (!options.path) { throw 'File - path is required'; }
    //set a default format to json
    if(typeof options.format === 'undefined'){ options.format='json'; }
    //set default delimiter if delimited
    if(options.format === 'delimited' && typeof options.pattern === 'undefined'){ options.pattern=','; }
    if(typeof options.fields !== 'undefined' && options.fields !== ''){ 
      var arrFields=options.fields.split(','); 
      arrFields.unshift('raw');
    }
    if (fileIO && fileIO.watch) {
      fileIO.watch();
      return;
    }

    fileIO = new Tail(options.path, { follow: true });

    fileIO.on('line', function(strData) {
      options.pattern = options.pattern.replace(/\\"/g, '"');
      console.log('regex',options.pattern);
        //decide what type of format we are working with
        switch (options.format) {
          case 'json':
            try { options.onMessage(JSON.parse(strData)); }
            catch(err){ console.log('There is a problem parsing the json'); }
            break;
          case 'delimited':
            try {
              var objData={};
              //split the data by delimited, then map to fields
              var arrData = strData.split(options.pattern);
              for(var i=0; i<arrData.length;i++){
                if(typeof arrFields[i] !== 'undefined'){ objData[arrFields[i]]=arrData[i]; }
                else{ objData[i]=arrData[i]; }
              }
              options.onMessage(objData); 
            }
            catch(err){ console.log('There is a problem parsing the log'); }
            break;
          case 'regex':
            try { 
              var objData={};

              var objRegex= new RegExp(options.pattern, "g");
              var arrData = objRegex.exec(strData);
              console.log(arrData);
              for(var i=0; i<arrData.length;i++){
                if(typeof arrFields[i] !== 'undefined'){ objData[arrFields[i]]=arrData[i]; }
                else{ objData[i]=arrData[i]; }
              }
              options.onMessage(objData);
            }
            catch(err){ console.log('There is a problem parsing the line with the regex pattern'); }
            break;
        }
    });

    fileIO.on('error', function(err) {
      console.log('Metastream Tail ERROR: ', err);
    });
  };

  self.close = function() {
    if (fileIO && fileIO.unwatch) {
      fileIO.unwatch();
    }
  };
}

exports.Tail = FileTail;
