
import url from 'url'
import path from 'path'
import fsH from './fsHelp.js'
import sitesH from './sitesHelp.js'
import { mkVueTemplateStr } from './vueHelp.js';
import mimeH from './mimeHelp.js'
//import { resJson } from './serverHttp.js';

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

async function transformIt( server, filePath , res, req){
    //console.log(`transformIt filePath: ${filePath}`);
    let transformedResult = await server.transformRequest(filePath, {
        ssr: false, // Set ssr to false for client-side code
        });
    if (transformedResult) {
        try{
            res.setHeader('Content-Type', 'application/javascript');
        }catch(e){
            console.error(`transform can't set header on response :/`,e);
        }
        res.end(transformedResult.code);
        //console.log(`ok so send it as transformed :)\n\n${transformedResult.code}`);
        return 0;
    }
    return `transforme error :(`;
}

function requestYss( req, res, next, config, server, yssPages ){

    var { method } = req;
    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname;
    var query = parsedUrl.query;
    let filePathFull = path.resolve( '/', req.url.substring(1) );
    let bT = bStart('All Query');
    //cl(`[d] parsedUrl: ${parsedUrl.pathname}  filePathFull: `+filePathFull+"\n\tend:"+filePathFull.endsWith('.html'));
    
    
    if( pathname.substring(0,14) == '/yss/external/' ){
        cl(`[i] got external request ...${pathname}`);
        pathname = '/yss/sitesTestExtDir/'+pathname.substring(14);
    }

    
    /*if( method == 'POST' ){
        if( pathname == '/api' ){
            cl(`[d] POST to / api ......`);

            cl(`[d] POST to / api ......DONE `);
        }
        
        //cl(`[d] POST`);
        //cl(query);
        //cl(parsedUrl);
        return 'no post action to do';
        //resJson(res, {"method": "POST", "pathname": pathname, "result": "OK" });
    

    } else
    */ 
    if( method == 'GET' ){
    
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
            if( t.length <= 3){
                resJson(res, {"pathname": pathname, "result": "ERROR", "msg": "wrong pathname" });      
                return 0;
            } else {
                let sNo = t[3];
                let fileTr = t.slice(4, t.length).join("/");
                if(0) console.log('doing /yss/siteNo/ -- debug \n',
                    '\nNo:',sNo,
                    '\nconfig.pathsToSites',config.pathsToSites,
                    '\nfileTr: ',fileTr
                );
                let fullPath = path.join( config.pathsToSites[sNo], fileTr );
                
                let p = yssPages;
              let doTns = false;
                for( let s of yssPages ){
                    if( doTns == true)
                        break; 

                    if( 1 ){
                        //s.oName == 'c_otdmtoolsPage' && String(fullPath).endsWith('c_otdmtoolsPage.js') ){
                        //console.log(s.modsrc);
                        //let abc = 1;
                        if( 
                            s.asModule == true &&
                            s.jssrc.length > 0 && 
                            String(s.siteNo) == sNo && 
                            String(fullPath).startsWith( s.fDir )
                        ){

                            for( let f of s.jssrc ){
                                if( String(fullPath).endsWith( f ) ){
                                    //console.log('will transform this one !');
                                    doTns = true;
                                    break;
                                }                   
                                
                            }

                            if( String(fullPath).endsWith('.vue' ) ){
                               doTns = true;
                                break;
                            }
                        }
                    }
                }


                if(  doTns
                    //fullPath.endsWith('.js') &&
                    //fullPath == '/home/yoyo/Apps/viteyss/node_modules/viteyss-site-otdmtools/c_otdmtoolsPage.js'
                ){
                    //console.log(`-- path: ${fullPath}`);
                    //console.log(`----------path now: ${config.pathsToSites[sNo]}`);
                    res.setHeader('Content-Type', 'application/javascript');
                    let tRes = transformIt(server, 
                        fullPath,
                        res, req);
                    tRes.then((r)=>{
                        //console.log(`so transform done:\n${r}`);
                    });
                    return 0;

                }

                //cl('[i] --- siteNo injection '+sNo);
                //resJson(res, {"pathname": pathname, "result": "OK", "siteNo": sNo, "tLen": t.length,
                //  "file": fileTr,
                //  "fullPath": fullPath
                // });
                let tr = fsH.fileRead(fullPath);
                if(tr == undefined ){
                    return 'no file found';
                }
                

                //if( mimeH.getExt(fullPath) == 'vue' ){
                if( filePathFull.endsWith('.vue') ){
                    tr = mkVueTemplateStr( tr, fullPath );
                }
                
                resSetHeaders( res, 200, getMimeFromExt(fullPath) );
                res.end(tr);
                return 0;
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
                
                /*
                if( filePathFull == '/yss/testy.js' ){
                    
                    let transformedResult = await server.transformRequest('/home/yoyo/Apps/oiyshTerminal/ySS_calibration/testy.js', {
                        ssr: false, // Set ssr to false for client-side code
                        });
                    if (transformedResult) {
                        res.setHeader('Content-Type', 'application/javascript');
                        res.end(transformedResult.code);
                        //console.log(`ok so send it as transformed :)\n\n${transformedResult.code}`);
                        return 0;
                    }


                }
                    */

                resSetHeaders( res, 200, getMimeFromExt(fPath) );
                res.end(tr);
                return 0;
            
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
                return 'no file in /yss/';

            }

            
        } else {
            //res404( '', res );
            return '404';

        } 
        
        
    } // end GET
    

    bEnd( bT );
    
    
    return 0;
}

function resJson( res, j ){
  resSetHeaders( res, code=200, contentType="text/javascript" );
  res.end( JSON.stringify(j) );
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


//module.exports = { dirList, fileToJson,fileRead,fileReadToStr, getTempFilePath };
export { requestYss, resSetHeaders, res404 };