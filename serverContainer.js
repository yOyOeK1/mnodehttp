

class serverContainer{
    
    
    constructor( sNo, config ){
        this.sNo = sNo;
        this.config = config;
        this.http = undefined;
        this.ws = undefined;
        
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
        this.ws = this.sws.getWsInstance( this.config );
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

}

module.exports = { serverContainer };