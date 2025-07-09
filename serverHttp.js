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
const WebSocket = require('ws');


/* setting / configs */
var HOST = 'localhost';
var HOST = '0.0.0.0';
var PORT = 8081;
var wsHOST = '0.0.0.0';
var wsPORT = 1999;
//var pathToYss = '/data/data/com.termux/files/home/.otdm';
//var pathToYss = '/home/yoyo/Apps/oiyshTerminal/ySS_calibration';
var pathToYss = path.join( 
    nyss.telMeYourHome(`serverHttp ${HOST}:${PORT}`),
    "yss"
  );

var wsInjection = false;
var wsInjection = true;
//var yssWSUrl = 'ws://192.168.43.220:1880/ws/yss';
//var yssWSUrl = "ws://192.168.43.1:1880/ws/accel/oriCal";
var yssWSUrl = `ws://192.168.43.220:${wsPORT}/`;

var sitesInjection = true;
// ---------------------





// --------- ws 
// https://github.com/websockets/ws/blob/master/doc/ws.md

function wsAllClients(){
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      //client.send(data, { binary: isBinary });
      console.log('client');
    }
  });
}

cl(`[i] Server running at ws://${wsHOST}:${wsPORT}`);
const wss = new WebSocket.Server({host: wsHOST ,port:wsPORT});
wss.on('connection', ws => {
  console.log('New client connected');

  wsAllClients();
  // Send a welcome message to the newly connected client
  ws.send('{"topic":"welcome","msg":"Welcome to the WebSocket server!"}');

  ws.on('message', message => {
    console.log(`Received message from client: ${message}`);

    // Echo the message back to the client
    ws.send(`Server received: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});


// ----------ws end




function cl(str){
//    console.log(str);
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
      cl("[i] server is stoped.");
      setTimeout(() => {
        server.close(() => {
          console.log('Server closed. No new connections will be accepted.');
          //process.exit();
          setTimeout(() => {startServer()},1000);

        });
      }, 1000);
        
    } else if( pathname.substring(0,4) == '/yss' ){
      //cl("[i] doing statics ...["+pathname+"]");
      let fPath = pathToYss+'/'+pathname.substring(5);
      let tr = fsH.fileRead(fPath);

      if( tr != undefined ){

        tr = sitesH.doInjectionForWs( wsInjection, pathname, yssWSUrl, tr ); 
        tr = sitesH.doInjectionForSites( sitesInjection, pathname, pathToYss, tr );

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


function startServer(){
  server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
  });

}

startServer();