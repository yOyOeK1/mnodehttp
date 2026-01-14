const fs = require('fs');
var path = require('node:path');
const fsH = require('./fsHelp.js');

let debug = 'viteyssDebug' in process.env ? (process.env.viteyssDebug=='true'?true:false) : false;

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

  //if( resAs == 'yssPages' ){
  //  debugger
  //}


  let keyOf = JSON.stringify( pathsToSites );
  cl(`  [cache] -[${keyOf}]-> `);
  if( 0 && casheCon[keyOf] ){
    cl("      YES");
    return casheCon[keyOf];
  }
  
  
  let ta = '';
  let yssPages = getYssPagesSitesIndex( pathsToSites );
  /*
  yssSites = getSitesIndex( path.join( pathToYss, 'sites' ), false);
  yssExtSites = getSitesIndex( path.join( pathToYss, 'sitesTestExtDir' ), true);
  yssPages = yssSites.concat( yssExtSites );
  */
  

let trsrc = [];
let trjs = [`function isPromise(value) {
  return (
    value &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof value.then === 'function'
  );
}
  `];
let sList= [];
let enabledC = 0;
let viteC = 0;
let moduleStr = '';
let moduleCode = '';
let sSet = {
  'srcs':[],
  'module':[]
};
  
  for( let p=0,pc=yssPages.length; p<pc; p++ ){
    let plug = yssPages[p];
    plug['o'] = {};
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
      

      let homeUrl = '';
      let jssrcLen = plug['jssrc'] != undefined ? plug['jssrc'].length: 0;
      for( let s=0,sc=jssrcLen; s<sc; s++ ){
          if( plug['external'] == false ){
            plug.o['homeUrl'] = `sites/`+plug['dir']+`/`+plug['jssrc'][s];  
            trsrc.push(`<script src="sites/`+plug['dir']+`/`+plug['jssrc'][s]+`"></script>`);   

            sSet.srcs.push(`sites/${lug['dir']}/${plug['jssrc'][s]}`);

              // plugin 
          }else if( plug['asPlugin'] == true && plug['asModule'] == true && plug['asVite'] == true  ){
            plug.o['homeUrl'] = `./siteNo/${plug['siteNo']}/${plug['dir']}`;
            trsrc.push(`<script type="module">\n`+
              ` //console.log('adding o import1  ${plug.o['homeUrl']}  / ${plug.oName}'); 
                import * as itmp from "./siteNo/${plug['siteNo']}/${plug['dir']}/${plug['jssrc'][s]}"; \n`+
              ` ${plug.oName} = itmp.${plug.oName}; \n`+
              `</script>\n`);
              
            sSet.module.push( [plug.oName, `./siteNo/${plug['siteNo']}/${plug['dir']}/${plug['jssrc'][s]}` ] );

              
          } else if( plug['external'] == true && plug['asVite'] == true ) {            
            plug.o['homeUrl'] = `/sites/${plug['dir']}`;
            trsrc.push(`<script type="module">\n`+
              ` //console.log('adding o import2  ${plug.o['homeUrl']}  / ${plug.oName}');
                import * as itmp from "/sites/${plug['dir']}/${plug['jssrc'][s]}"; \n`+
              ` ${plug.oName} = itmp.${plug.oName}; \n`+
              `</script>\n`);   
            
            sSet.module.push( [plug.oName, `/sites/${plug['dir']}/${plug['jssrc'][s]}`] );

            
          } else if( plug['external'] == true && plug['asModule'] == true ){
            plug.o['homeUrl'] = `./siteNo/${plug['siteNo']}/${plug['dir']}`;
            trsrc.push(`<script type="module">\n`+
                ` //console.log('adding o import3  ${plug.o['homeUrl']}  / ${plug.oName}'); 
                import * as itmp from "./siteNo/${plug['siteNo']}/${plug['dir']}/${plug['jssrc'][s]}"; \n`+
                ` ${plug.oName} = itmp.${plug.oName}; \n`+
              `</script>\n`);   

              sSet.module.push( [plug.oName, `./siteNo/${plug['siteNo']}/${plug['dir']}/${plug['jssrc'][s]}` ] );

            } else {
            
            plug.o['homeUrl'] = `./siteNo/${plug['siteNo']}/${plug['dir']}`;
            trsrc.push(`<script src="siteNo/${plug['siteNo']}/`+plug['dir']+`/`+plug['jssrc'][s]+`"></script>`);   
            sSet.srcs.push(`siteNo/${plug['siteNo']}/${plug['dir']}/${plug['jssrc'][s]}`);

          }
          
      }
      
      trjs.push( "\n// -- start of"+plug['oName']);
      //trjs.push( 'cl("adding: '+plug['oName']+' - nice "); console.log("adding2:",'+plug['oName']+' );' );
      //trjs.push( 'yssPages['+p+']["o"] = new '+plug['oName']+'();' );
      //trjs.push( 'yssPages['+p+']["o"]["instanceOf"] = '+JSON.stringify(plug)+';');
      //trjs.push( 'yssPages['+p+']["o"]["homeUrl"] = "'+homeUrl+'";');
      //trjs.push( 'pager.addPage( yssPages['+p+']["o"] );' );
      //trjs.push( "// -- end of"+plug['oName']+"\n" );

      
      
      trjs.push( `
 
  
  console.log('adding o ${plug.o['homeUrl']}  / ${plug.oName}');
  
  yssPages[${p}]["o"] = new ${plug['oName']}();
  yssPages[${p}]["o"]["instanceOf"] = ${JSON.stringify(plug)};
  yssPages[${p}]["o"]["homeUrl"] = "${plug.o['homeUrl']}";
  
  
  pager.addPage( yssPages[${p}]["o"] );
  
  // -- end of ${plug['oName']}

        `);

      
      if( plug['enable'] == false /* || plug['asVite'] == true */){
          trsrc.push( ' IS DISABLED -->' );
          trjs.push( ' IS DISABLED */' );
        }
        
      yssPages[p]['o'] = plug['o'];
  }
  
  
  let modVarSets = '';
  let modImportsSets = '';
  let modimportToVar = '';
  let modSrcs = '';
  sSet.module.forEach( (s, i) =>{
    modVarSets+=(`${s[0]}=-1, `);
    modImportsSets+=(`import * as itmp${i} from "${s[1]}";\n`);
    modimportToVar+=(`${s[0]} = itmp${i}.${s[0]};\n`);
  });
  sSet.srcs.forEach( ( s,i)=>{
    modSrcs+= `<script src="${s}"></script>\n`;
  });

  let newImportMods = `  

<!-- newImportMods  START -->


<!--  srcs -->
${modSrcs}

<!--  modules to window variables -->
<script>
var ${modVarSets} dummySiteCup=null;
</script>

<!--  modules import asign to window variables -->
<script type="module">
${modImportsSets}

${modimportToVar}
</script>


<!-- newImportMods  END -->
`;
  
  ta+= ` built automaticli in sitesHelp.js -->
  
  
  
  <script>
  
  console.group('Sites init');
  var yssPages = `+JSON.stringify(yssPages)+`;
  console.log('adding master list ...');
  
  var siteSet = ${JSON.stringify(sSet)};
  
  </script>
  
<!--/////////////////////// start NEW-->
${newImportMods}
<!--/////////////////////// END NEW-->

`+
/*`/////////////////////// OLD start 
${trsrc.join("\n")}
/////////////////////// OLD END`+*/
`

  <script>
  
  var siteByKey = {};
  yssPages.forEach(s => {
    //console.log("doing: "+s.oName);
    siteByKey[ s.oName ] = s; 
  });
  
  
  function nodeRedInjectionAddPages(){
      cl("node red injection add page .......");
      `+trjs.join("\n\t")+`
      }

    
console.groupEnd('Sites init');
      </script>

<!--build automaticli in sitesHelp.js\n`;

      mesCashe = "sites build count: "+yssPages.length+` / `+sList.length+` enabled: ${enabledC}/${sList.length}`;
      cl("[i] sites build count: "+yssPages.length+` / `+sList.length+
        `\n\t `+sList.join(', ')+'\n'+
        `* enabled: ${enabledC}/${sList.length} and (${viteC}) in asVite`
      );
      //cl(yssPages);
      mcashe = ta;
      
  //casheCon[keyOf] = ta;
  
  if( resAs == 'html' )
    return ta;
  else if( resAs == 'yssPages' )
    return yssPages;

}

function getYssPagesSitesIndex( pathToScan ){
  let yssPages = [];
  for( let p=0,pc=pathToScan.length; p<pc; p++ ){
    let yptmp = getSitesIndex( pathToScan[p], p );
    let yptmpLen = yptmp.length;
    if( debug ) cl(`  have ${yptmpLen} sites ...`);
    yssPages = yssPages.concat( yptmp );
  }
  return yssPages;
}

function doSiteToJ( path2index, listd, siteNo ){
  fPathStr = path.join( path2index, listd, `site.json` );
  //cl('doSiteToJ: fPathStr: '+fPathStr);
  let j = fsH.fileToJson( fPathStr );
  if( j == undefined ){
    //process.stdout.write(`E dir [${fPathStr}] without site.json file !!!`);
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
  if(debug) cl(" indexing siteNo["+siteNo+"] : "+path2index);
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
    if( debug ) cl("[d] direct site path :) (plugin ?)")
    tr.push( j );
  }

  return tr;

}

module.exports = { getSitesIndex, doInjectionForWs, doInjectionForSites, getInjectionStr,zeroSitesIndex, yssPagesArrayLast };
