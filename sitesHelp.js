const fs = require('fs');
var path = require('node:path');
const fsH = require('./fsHelp.js');

var mcashe = '';
var mesCashe = '';
var yssPagesArrayLast = -1;

function cl(str){
    console.log(str);
}

function doInjectionForWs( wsInjection, pathname, yssWSUrl, tr ){
  if( wsInjection == true && pathname.substring(4) == '/libs/mWebSockets.js' ){
    cl("--- have /libs/mWebSockets.js ---");
    tr = tr.toString().replace(
      new RegExp("ws://192.168.43.1:1880/ws/accel/oriCal", 'g'),
      yssWSUrl          
    );
    cl("  injection done");  
  }
  return tr;
}

function doInjectionForSites( sitesInjection, pathname, pathToYss, pathsToSites, tr ){
  if( sitesInjection == true && pathname.substring(4) == '/index.html' ){
    cl("--- have /index.html ---");
    let ta = getInjectionStr( pathToYss, pathsToSites );
    tr = tr.toString().replace( "noderedinjectpoint", ta);      
    cl("  injection done");
  }
  return tr;
}


function zeroSitesIndex( pathToYss ){
  mcashe = '';
  //getInjectionStr( pathToYss );
}

var casheCon = {};

function getInjectionStr( pathToYss, pathsToSites, resAs = 'html' ){
  /*if( 0 && mcashe != '' ){
    cl(`[cashe] sites index: ${mesCashe}`);
    return mcashe;
  } 
  */
  let keyOf = JSON.stringify( pathsToSites );
  cl(`  [cache] -[${keyOf}]-> `);
  if( 0 && casheCon[keyOf] ){
    cl("      YES");
    return casheCon[keyOf];
  }


  let ta = '';
  /*
  yssSites = getSitesIndex( path.join( pathToYss, 'sites' ), false);
  yssExtSites = getSitesIndex( path.join( pathToYss, 'sitesTestExtDir' ), true);
  yssPages = yssSites.concat( yssExtSites );
  */
  let yssPages = [];
  for( let p=0,pc=pathsToSites.length; p<pc; p++ ){
    let yptmp = getSitesIndex( pathsToSites[p], p );
    let yptmpLen = yptmp.length;
    cl(`  have ${yptmpLen} sites ...`);
    yssPages = yssPages.concat( yptmp );
  }

  trsrc = [];
  trjs = [];
  sList= [];
  enabledC = 0;
  viteC = 0;
  moduleStr = '';
  moduleCode = '';
  
  for( let p=0,pc=yssPages.length; p<pc; p++ ){
      var plug = yssPages[p];
      //cl(`making site: ${plug.dir} name [${plug.oName}]`);


      if( plug['enable'] == false /*|| plug['asVite'] == true */){
        trsrc.push( '<!-- IS DISABLED ' );
        trjs.push('/* IS DISABLED ');
      }


      sList.push( 
        (plug['asVite'] == true  ? 'V' :'')+
        (plug['enable'] == true ? 'E-' : 'D-') + 
        plug.oName 
      );
      
      if( plug['enable'] == true ) enabledC++;
      if( plug['asVite'] == true ) viteC++;
      
      if( plug['asModule'] == true ){
        trsrc.push(`<script>var ${plug.oName} = -1;</script>`);
       
      }


      for( let s=0,sc=plug['jssrc'].length; s<sc; s++ ){
          if( plug['external'] == false ){
              trsrc.push(`<script src="sites/`+plug['dir']+`/`+plug['jssrc'][s]+`"></script>`);   

          // plugin 
          }else if( plug['asPlugin'] == true && plug['asModule'] == true && plug['asVite'] == true  ){
             trsrc.push(`<script type="module">\n`+
                ` import * as itmp from "./siteNo/${plug['siteNo']}/${plug['dir']}/${plug['jssrc'][s]}"; \n`+
                ` ${plug.oName} = itmp.${plug.oName}; \n`+
              `</script>\n`);   

          } else if( plug['external'] == true && plug['asVite'] == true ) {
            
            trsrc.push(`<script type="module">\n`+
              ` import * as itmp from "/sites/${plug['dir']}/${plug['jssrc'][s]}"; \n`+
              ` ${plug.oName} = itmp.${plug.oName}; \n`+
              `</script>\n`);   
              
          } else if( plug['external'] == true && plug['asModule'] == true ){

            trsrc.push(`<script type="module">\n`+
                ` import * as itmp from "./siteNo/${plug['siteNo']}/${plug['dir']}/${plug['jssrc'][s]}"; \n`+
                ` ${plug.oName} = itmp.${plug.oName}; \n`+
              `</script>\n`);   

          } else {
            
            trsrc.push(`<script src="siteNo/${plug['siteNo']}/`+plug['dir']+`/`+plug['jssrc'][s]+`"></script>`);   

          }

      }
      
      trjs.push( "\n// -- start of"+plug['oName']);
      trjs.push( 'cl("adding: '+plug['oName']+'"); ' );
      trjs.push( 'yssPages['+p+']["o"] = new '+plug['oName']+'();' );
      trjs.push( 'yssPages['+p+']["o"]["instanceOf"] = '+JSON.stringify(plug)+';');
      trjs.push( 'pager.addPage( yssPages['+p+']["o"] );' );
      trjs.push( "// -- end of"+plug['oName']+"\n" );
      
      if( plug['enable'] == false /* || plug['asVite'] == true */){
          trsrc.push( ' IS DISABLED -->' );
          trjs.push( ' IS DISABLED */' );
      }

  }
  
  
  
  ta+= ` built automaticli in sitesHelp.js -->
  `+trsrc.join("\n")+`
  <script>

  var yssPages = `+JSON.stringify(yssPages)+`;

  function nodeRedInjectionAddPages(){
      cl("node red injection add page .......");
      `+trjs.join("\n\t")+`
  }
  </script>
  <!--build automaticli in sitesHelp.js `;

  mesCashe = "sites build count: "+yssPages.length+` / `+sList.length+` enabled: ${enabledC}/${sList.length}`;
  cl("[i] sites build count: "+yssPages.length+` / `+sList.length+
    `\n\t `+sList.join(', ')+'\n'+
    `enabled: ${enabledC}/${sList.length} and (${viteC}) in asVite`
   );
   //cl(yssPages);
  mcashe = ta;
  
  //casheCon[keyOf] = ta;
  
  if( resAs == 'html' )
    return ta;
  else if( resAs == 'yssPages' )
    return yssPages;

}


function doSiteToJ( path2index, listd, siteNo ){
  fPathStr = path.join( path2index, listd, `site.json` );
  //cl('doSiteToJ: fPathStr: '+fPathStr);
  let j = fsH.fileToJson( fPathStr );
  if( j == undefined ){
    cl(`E dir [${fPathStr}] without site.json file !!!`);
    return undefined;
  }else{
    j["dir"] = listd;
    j["fDir"] = path.join( path2index, listd );
    j["external"] = true;        
    j['siteNo'] = siteNo;
    return j;
  }
}

function getSitesIndex( path2index, siteNo = undefined ){
  cl(" indexing siteNo["+siteNo+"] : "+path2index);
  let list = fsH.dirList( path2index );
  if( list == undefined ) return [];
  let tr = [];

  // dis with subdirectoris?
  for( let d=0,dc=list.length; d<dc; d++ ){
    try{
      //dir
      fsStat = fs.statSync(  path.join( path2index, list[d] ) );
      if( fsStat.isDirectory() ){
        
        // do directory of site
        let j = doSiteToJ( path2index, list[d], siteNo );
        if( j != undefined ){
          tr.push(j);

        }
      }
    }catch(e){
      cl(`E getSitesIndex at siteNo: [${siteNo}] [${path2index}] -> ${list[d]}: ${e}`);
    }

  }

  // direct site path
  let j = doSiteToJ( path2index, '', siteNo );
  if( j != undefined ){
    cl("[d] direct site path :) (plugin ?)")
    tr.push( j );
  }

  return tr;

}

module.exports = { getSitesIndex, doInjectionForWs, doInjectionForSites, getInjectionStr,zeroSitesIndex, yssPagesArrayLast };
