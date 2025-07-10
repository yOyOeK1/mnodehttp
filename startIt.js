

var serCon = require('./serverContainer');
const nyss = require("node-yss");

const path = require('path');
const { config } = require('process');



function cl(str){
    console.log('staI',str);

}


config0 = {
    'name': "bigOne",
    'HOST': '0.0.0.0',
    'PORT': 8081,
    'wsHOST': '0.0.0.0',
    'wsPORT': 1999,
    'pathToYss': '/home/yoyo/Apps/oiyshTerminal/ySS_calibration',
    'pathsToSites': [
      '/home/yoyo/Apps/oiyshTerminal/ySS_calibration/sites'
    ],    
    'wsInjection': false,
    'wsInjection': true,
    'yssWSUrl': `ws://192.168.43.220:1999/`,
    
    'sitesInjection': true,
    'ws': undefined,
    'wsPinger': true
};



cl("Hello");

//let sc0 = new serCon.serverContainer(0,config0 );
//sc0.initServers();
//sc0.startServer();



config1 = JSON.parse(JSON.stringify(config0));;
config1.name = 'small';
config1.HOST = 'localhost';
config1.PORT = 8080;
config1.wsHOST = 'localhost';
config1.wsPORT = 2999;
config1.pathToYss = path.join( nyss.telMeYourHome(`serverHttp ${config1.HOST}:${config1.PORT}`),"yss" );
config1.pathsToSites = [ path.join( config1.pathToYss, 'sites' ) ]; // add more locations
config1.yssWSUrl = `ws://localhost:2999/`;
let sc1 = new serCon.serverContainer( 1, config1 );

sc1.initServers();
sc1.startServer();
cl(`Open web browser at: http://${config1.HOST}:${config1.PORT}`);

cl("Done --- end");