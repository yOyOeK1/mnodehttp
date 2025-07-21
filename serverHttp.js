#!/usr/bin/env node



var http = require('http');

const fsH = require('./fsHelp.js');
dirList = fsH.dirList;
const mimeH = require('./mimeHelp.js');
getMimeFromExt = mimeH.getMimeFromExt;
var sitesH = require('./sitesHelp.js');
const nyss = require("node-yss");

const fs = require('fs');
const path = require('path');
var sws = require('./serverWs.js');
const { mkVueTemplateStr } = require('./vueHelp.js');
const { requestYss } = require('./yssHelp.js');
const { resSetHeaders } = require('./yssHelp.js');
const { res404 } = require('./yssHelp.js');

var config = undefined;
/* setting / configs */
/*
var HOST = 'localhost';
var HOST = '0.0.0.0';
var PORT = 8080;
var wsHOST = '0.0.0.0';
var wsPORT = 1999;

let yssFrom = 1; // 2 production | 1 dev 
if( yssFrom == 0 ){
  var pathToYss = '/data/data/com.termux/files/home/.otdm';
}else if( yssFrom == 1 ){
  var pathToYss = '/home/yoyo/Apps/oiyshTerminal/ySS_calibration';
}else if ( yssFrom == 2 ){
  var pathToYss = path.join( 
    nyss.telMeYourHome(`serverHttp ${HOST}:${PORT}`),
    "yss"
  );
}

let pathsToSites = [
  //path.join( pathToYss, 'sites' ),
  '/home/yoyo/Apps/oiyshTerminal/ySS_calibration/sites'
];


var wsInjection = false;
var wsInjection = true;
//var yssWSUrl = 'ws://192.168.43.220:1880/ws/yss';
//var yssWSUrl = "ws://192.168.43.1:1880/ws/accel/oriCal";
var yssWSUrl = `ws://192.168.43.220:${wsPORT}/`;

var sitesInjection = true;
var ws = undefined;
var wsPinger = false;
// ---------------------

*/


function cl(str){
    console.log('shtt', str);
}


class serverHttp {

  constructor( nconfig, nwss, nws ){
    this.config = nconfig;
    this.wss = nwss;
    this.ws = nws;
    this.http = undefined;
    this.isRunning = false;
    this.wsPingIter = undefined;
    this.pingCount = 0;
    this.cl('serverHttp init ....'+this.config.name);
  }

  cl(str) {
    console.log('serH',str);
    
  }

  

  mkInstance(){
    this.cl('mkInstance: ['+this.config.name+'] http://'+this.config.HOST+":"+this.config.PORT);
    this.http = http.createServer((req, res) => {
      
      requestYss( req, res, ()=>{
        cl(`404 by next() `);
        res404( '', res );
      }, this.config );

    });

  }


  startServer(){
    this.cl("[i] StartServer of ["+this.config.name+"] ...");//this.cl(this.http);
    this.http.listen(this.config.PORT, this.config.HOST, () => {
      this.cl(`[i] Server HTTP [${this.config.name}] running at http://${this.config.HOST}:${this.config.PORT}/`);
      //ws = sws.getWsInstance( wsHOST, wsPORT );

    });

    if( this.config.wsPinger ){
      if( this.wsPingInter == undefined ){
        this.wsPingInter = setInterval( ()=>{this.sendPingOnWs();}, 10000 );
      }
    }

  }

  stopServer(){
    this.cl("[i] StopServer of ["+this.config.name+"]");
    this.http.close(()=>{cl('[i] Server http closed. No new connections will be accepted.');});
    if( this.wsPingInter != undefined ){
      cl("stopPing Interval ...");
      clearInterval( this.wsPingInter );
    }
    
  }

  sendPingOnWs(){
    //this.cl("ping ...");
    this.pingCount++;
    if( sws.wsClientsOnline( this.ws ) != 0 ){
     sws.sendToAll(this.ws, `{"topic":"ping","payload":"pong", "count":"${this.pingCount}"}`,
        "["+this.config.name+'] ping'
      );
    
    }
  }

}




//// ---------------------

/*
function resSetHeaders( res, code = 200, contentType = 'text/plain' ){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  res.writeHead(code, { 'Content-Type': contentType });
}
*/
function resJson( res, j ){
  resSetHeaders( res, code=200, contentType="text/javascript" );
  res.end( JSON.stringify(j) );
}

/*
function res404( str, res ){
  resSetHeaders( res, code=404,contentType='text/html' );
  res.end(`<!DOCTYPE html>
    <html>
    <head>
    <meta http-equiv="refresh" content="1; url='/yss/index.html'" />
    </head>
    <body>
    <b>404 ${str}</b>
    <p>Please follow <a href="/yss/index.html">/yss/index.html</a>.</p>
    </body>
    </html>`);      
}    
*/

function bStart(title){
  return { 'title': title, 'tStart': Date.now() };
}
function bEnd( bStartRes ){
  let inT = Date.now()-bStartRes.tStart; 
  //cl(`[ben] ${bStartRes.title} in ${inT}mil`);
}

var serverRunnit = true;
var server = undefined;







//startServer();


module.exports = { serverHttp };