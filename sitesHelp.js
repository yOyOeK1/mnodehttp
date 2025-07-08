const fs = require('fs');
const fsH = require('./fsHelp.js');

var mcashe = '';
var mesCashe = '';

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

function doInjectionForSites( sitesInjection, pathname, pathToYss, tr ){
  if( sitesInjection == true && pathname.substring(4) == '/index.html' ){
    cl("--- have /index.html ---");
    let ta = getInjectionStr( pathToYss );
    tr = tr.toString().replace( "noderedinjectpoint", ta);      
    cl("  injection done");
  }
  return tr;
}


function zeroSitesIndex( pathToYss ){
  mcashe = '';
  //getInjectionStr( pathToYss );
}

function getInjectionStr( pathToYss ){
  if( mcashe != '' ){
    cl(`[cashe] sites index: ${mesCashe}`);
    return mcashe;
  } 

  let ta = '';
  yssSites = getSitesIndex(pathToYss+'/sites', false);
  yssExtSites = getSitesIndex(pathToYss+'/sitesTestExtDir', true);
  yssPages = yssSites.concat( yssExtSites );

  trsrc = [];
  trjs = [];
  sList= [];
  enabledC = 0;
  
  for( var p=0,pc=yssPages.length; p<pc; p++ ){
      var plug = yssPages[p];
      //cl(`making site: ${plug.dir} name [${plug.oName}]`);
      if( plug['enable'] == false ){
        trsrc.push( '<!-- IS DISABLED ' );
        trjs.push('/* IS DISABLED ');
      }
      sList.push( (plug['enable'] == true?'E-':'D-')+plug.oName );
      if( plug['enable'] == true ) enabledC++;
      
      for( var s=0,sc=plug['jssrc'].length; s<sc; s++ ){
          if( plug['external'] == false )
              trsrc.push(`<script src="sites/`+plug['dir']+`/`+plug['jssrc'][s]+`"></script>`);   
          else 
              trsrc.push(`<script src="external/`+plug['fDir']+`/`+plug['jssrc'][s]+`"></script>`);   
      }
      
      trjs.push( "\n// -- start of"+plug['oName']);
      trjs.push( 'cl("adding: '+plug['oName']+'"); ' );
      trjs.push( 'yssPages['+p+']["o"] = new '+plug['oName']+'();' );
      trjs.push( 'yssPages['+p+']["o"]["instanceOf"] = '+JSON.stringify(plug)+';');
      trjs.push( 'pager.addPage( yssPages['+p+']["o"] );' );
      trjs.push( "// -- end of"+plug['oName']+"\n" );
      
      if( plug['enable'] == false ){
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
    `enabled: ${enabledC}/${sList.length}`
   );
   //cl(yssPages);
  mcashe = ta;
  
  return ta;

}

function getSitesIndex( path, external ){
  let list = dirList( path );
  if( list == undefined ) return [];
  let tr = [];
  
  for( let d=0,dc=list.length; d<dc; d++ ){
    try{
      fsStat = fs.statSync( `${path}/`+list[d] );
      if( fsStat.isDirectory() ){
        let j = fsH.fileToJson(`${path}/${list[d]}/site.json`);
        if( j == undefined ){
            
        }else{
          j["dir"] = list[d];
          j["fDir"] = (external==true?``:`${path}/`)+`${list[d]}`;
          j["external"] = external;        
          
          tr.push(j);
        }
      }
    }catch(e){
      cl(`E getSitesIndex at [${path}] -> ${list[d]}: ${e}`);
    }

  }

  return tr;

}

module.exports = { getSitesIndex, doInjectionForWs, doInjectionForSites, getInjectionStr,zeroSitesIndex };