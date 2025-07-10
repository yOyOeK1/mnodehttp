#!/usr/bin/env node



var http = require('http');
var url = require('url');
const fsH = require('./fsHelp.js');
dirList = fsH.dirList;
const mimeH = require('./mimeHelp.js');
getMimeFromExt = mimeH.getMimeFromExt;
const sitesH = require('./sitesHelp.js');
const nyss = require("node-yss");

const fs = require('fs');
const path = require('path');
var sws = require('./serverWs.js');



/* setting / configs */
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
var wsPinger = true;
// ---------------------



function cl(str){
    console.log('shtt', str);
}

function resSetHeaders( res, code = 200, contentType = 'text/plain' ){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  res.writeHead(code, { 'Content-Type': contentType });
}

function resJson( res, j ){
  resSetHeaders( res, code=200, contentType="text/javascript" );
  res.end( JSON.stringify(j) );
}

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


function bStart(title){
  return { 'title': title, 'tStart': Date.now() };
}
function bEnd( bStartRes ){
  let inT = Date.now()-bStartRes.tStart; 
  //cl(`[ben] ${bStartRes.title} in ${inT}mil`);
}

var serverRunnit = true;
var server = http.createServer((req, res) => {
  var { method } = req;
  var parsedUrl = url.parse(req.url, true);
  var pathname = parsedUrl.pathname;
  var query = parsedUrl.query;

  let bT = bStart('All Query');
  
  //console.log("ok req:",req);
  
  //if( pathname == '/yss' || pathname == '/yss/' ){
  //  cl('xxxx');
  //  pathname = '/yss/index.html';
  //} 
//cl(`---pathname [${pathname}]`);

  if( pathname.substring(0,14) == '/yss/external/' ){
    cl(`[i] got external request ...${pathname}`);
    pathname = '/yss/sitesTestExtDir/'+pathname.substring(14);
  }

  if( method == 'POST' ){
    
    cl(`[d] POST`);
    cl(query);
    cl(parsedUrl);
    resJson(res, {"method": "POST", "pathname": pathname, "result": "OK" });
    

  } else if( method == 'GET' ){
    
    if( pathname == '/zeroSites' ){
      cl("--- zero sites ---");
      sitesH.zeroSitesIndex( pathToYss );
      resJson(res, {"pathname": pathname, "result": "OK" });
        
    } else if( pathname == '/stopServer' ){
      cl("--- stop server ---");
      resJson(res, {"pathname": pathname, "result": "OK" });
      cl("[i] server is stoping ...");
      sws.sendToAll( ws, `{"topic":"ws/event","payload":"server going down"}`);
      setTimeout(() => {
        cl('ws closing ....');
        sws.closeAll( ws, 'http down');
        ws.close();
        cl('ws closed');

        server.close(() => {
          cl('Server http closed. No new connections will be accepted.');
          //process.exit();
          setTimeout(() => {startServer()},1000);

        });
      }, 1000);
    } else if( pathname.substring(0,12) == '/yss/siteNo/' ){
      let t = pathname.split('/');
      if( t.length <= 5){
        resJson(res, {"pathname": pathname, "result": "ERROR", "msg": "wrong pathname" });      
      } else {
        let sNo = t[3];
        let fileTr = t.slice(4, t.length).join("/");
        let fullPath = path.join( pathsToSites[sNo], fileTr );
        //cl('[i] --- siteNo injection '+sNo);
        //resJson(res, {"pathname": pathname, "result": "OK", "siteNo": sNo, "tLen": t.length,
        //  "file": fileTr,
        //  "fullPath": fullPath
        // });
        let tr = fsH.fileRead(fullPath);
        resSetHeaders( res, code=200, contentType=getMimeFromExt(fullPath) );
        res.end(tr);

      }
      


    } else if( pathname.substring(0,4) == '/yss' ){
      //cl("[i] doing statics ...["+pathname+"]");
      let fPath = pathToYss+'/'+pathname.substring(5);
      let tr = fsH.fileRead(fPath);

      if( tr != undefined ){

        tr = sitesH.doInjectionForWs( wsInjection, pathname, yssWSUrl, tr ); 
        tr = sitesH.doInjectionForSites( sitesInjection, pathname, pathToYss, pathsToSites, tr );

        resSetHeaders( res, code=200, contentType=getMimeFromExt(fPath) );
        res.end(tr);
        
      } else { // no file found in /yss/....
        let tp = `<pre>
          Deb info ...
          fPath: ${fPath}
          tr: ${tr}
          method: ${method}
          query: `+(JSON.stringify(query))+`
          path: `+pathname+`</pre>`;
        res404( tp, res );      
        cl(`[e] no file found: ${pathname}`);//cl(tp);

      }
        
    } else {
      res404( '', res );

    } 
    
    
  } // end GET
   

  bEnd( bT );
    
}); 

function sendPingOnWs(){
  sws.sendToAll(ws, '{"topic":"ping","payload":"pong"}');
}

let wsPingInter = undefined;
if( wsPinger ){
  if( wsPingInter == undefined ){
    wsPingInter = setInterval( sendPingOnWs, 10000 );

  }
}

function startServer(){
  server.listen(PORT, HOST, () => {
    cl(`Server HTTP running at http://${HOST}:${PORT}/`);
    ws = sws.getWsInstance( wsHOST, wsPORT );

  });

}

startServer();