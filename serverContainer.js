

class serverContainer{
    
    
    constructor( sNo, config, nwsCallBack = undefined ){
        this.sNo = sNo;
        this.config = config;
        this.http = undefined;
        this.ws = undefined;
        this.wsCallBack = nwsCallBack;
        
        this.sws = require('./serverWs');
        this.shh = require('./serverHttp');

        this.wsRunning = false;
        this.httpRunning = false;

        this.cl(`init ...`);
    }

    cl(str){
        console.log(`sco${this.sNo}`,str);
    }

    initServers(){
        this.cl('initServers ...');
        //this.cl(this.config);
        this.cl('   ws ...');
        this.ws = this.sws.getWsInstance( this.config, this.wsCallBack );
        this.wsRunning = true; // TODO check in nicer way if it's fine
        this.cl('   http ...');
        //this.shh.setWs( this.ws, this.sws );
        //this.http = this.shh.getHttpInstance( this.config );
        this.http = new this.shh.serverHttp( this.config, this.sws, this.ws );
        this.http.mkInstance();
    }

    startServer(){
        this.cl("startServer ....");
        this.http.startServer();
        this.httpRunning = true;// TODO check in nicer way if it's fine
    }

    stopServer(){
        this.cl("stopServer ....");
        this.cl("http stop...");
        this.http.stopServer();
        delete this.http;
        this.http = undefined;
        this.cl("ws closeall ...");
        this.sws.closeAll( this.ws , "going down by service container");
        this.cl("ws close ...");
        this.ws.close(()=>{this.cl("ws is down by service container");});
        this.cl("ws terminate ...");
        this.ws.terminate();
        delete this.ws;
        this.ws = undefined;
    }

}

module.exports = { serverContainer };