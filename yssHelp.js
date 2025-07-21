
import url from 'url'
import path from 'path'
import fsH from './fsHelp.js'
import sitesH from './sitesHelp.js'
import { mkVueTemplateStr } from './vueHelp.js';
import mimeH from './mimeHelp.js'

const getMimeFromExt = mimeH.getMimeFromExt;


function cl(str){
    console.log('yssH', str);
}


function bStart(title){
  return { 'title': title, 'tStart': Date.now() };
}
function bEnd( bStartRes ){
  let inT = Date.now()-bStartRes.tStart; 
  //cl(`[ben] ${bStartRes.title} in ${inT}mil`);
}

function requestYss( req, res, next, config ){

    var { method } = req;
    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname;
    var query = parsedUrl.query;
    let filePathFull = path.resolve( '/', req.url.substring(1) );
    let bT = bStart('All Query');
    //cl('[d] filePathFull: '+filePathFull+"\n\tend:"+filePathFull.endsWith('.html'));
    
    
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
            sitesH.zeroSitesIndex( config.pathToYss );
            resJson(res, {"pathname": pathname, "result": "OK" });
            
        } else if( pathname == '/stopServer' ){
            cl("--- stop server ---");
            resJson(res, {"pathname": pathname, "result": "OK" });
            cl("[i] server is stoping ...");
            sws.sendToAll( this.ws, `{"topic":"ws/event","payload":"server going down"}`);
            setTimeout(() => {
            cl('ws closing ....');
            sws.closeAll( this.ws, 'http down');
            this.ws.close();
            cl('ws closed');

            this.http.close(() => {
                cl('Server http closed. No new connections will be accepted.');
                //process.exit();
                setTimeout(() => {this.startServer()},1000);

            });
            }, 1000);

        } else if( pathname.substring(0,12) == '/yss/siteNo/' ){

            let t = pathname.split('/');
            if( t.length <= 5){
            resJson(res, {"pathname": pathname, "result": "ERROR", "msg": "wrong pathname" });      
            } else {
            let sNo = t[3];
            let fileTr = t.slice(4, t.length).join("/");
            let fullPath = path.join( config.pathsToSites[sNo], fileTr );
            //cl('[i] --- siteNo injection '+sNo);
            //resJson(res, {"pathname": pathname, "result": "OK", "siteNo": sNo, "tLen": t.length,
            //  "file": fileTr,
            //  "fullPath": fullPath
            // });
            let tr = fsH.fileRead(fullPath);
            if(tr == undefined ){
                next();
                return 0;
            }
            
            //if( mimeH.getExt(fullPath) == 'vue' ){
            if( filePathFull.endsWith('.vue') ){
                tr = mkVueTemplateStr( tr, fullPath );
            }
            
            resSetHeaders( res, 200, getMimeFromExt(fullPath) );
            res.end(tr);

            }
            

        } else if( filePathFull.startsWith('/yss/') ){

            //cl("[i] doing statics ...["+pathname+"]");
            let fPath = config.pathToYss+'/'+pathname.substring(5);
            let tr = fsH.fileRead(fPath);

            if( tr != undefined ){

                if( filePathFull == '/yss/libs/mWebSockets.js' )
                    tr = sitesH.doInjectionForWs( config.wsInjection, pathname, config.yssWSUrl, tr ); 
                
                if( filePathFull == '/yss/index.html' )
                    tr = sitesH.doInjectionForSites( config.sitesInjection, pathname, config.pathToYss, config.pathsToSites, tr );


                resSetHeaders( res, 200, getMimeFromExt(fPath) );
                res.end(tr);
            
            } else { //  no file found in /yss/....
                let tp = `<pre>
                    Deb info ...
                    fPath: ${fPath}
                    tr: ${tr}
                    method: ${method}
                    query: `+(JSON.stringify(query))+`
                    path: `+pathname+`</pre>`;
                //res404( tp, res );      
                cl(`[e] no file found: ${pathname}`);//cl(tp);
                next();

            }
            
        } else {
            //res404( '', res );
            next();

        } 
        
        
    } // end GET
    

    bEnd( bT );
    
    

}



function resSetHeaders( res, code = 200, contentType = 'text/plain' ){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  res.writeHead(code, { 'Content-Type': contentType });
}

function res404( str, res ){
  resSetHeaders( res, 404,'text/html' );
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


export { requestYss, resSetHeaders, res404 };