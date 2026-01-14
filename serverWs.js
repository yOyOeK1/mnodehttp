
const WebSocket = require('ws');


function cl(str){
    console.log('[sWS] ', str);
}


// --------- ws 
// https://github.com/websockets/ws/blob/master/doc/ws.md

function wsClientsOnline( ws ){
    let c = 0;
    ws.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            c++;
        }
    });
    return c;
    
}

function wsAllClients( ws ){
    let c = wsClientsOnline( ws );
    cl(`client count connected: ${c}`);
}

function sendToAll( ws, data, who = '' ){
    if( who != '' )cl(`sendToAll [${who}]: `);
    //cl('wss.clients: ');cl(wss.clients);
    //if( wss.clients == undefined ) return -1;

    ws.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

function closeAll( ws, msg ){
    ws.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.close();
        }
    });
}


function getWsInstance( nconfig, cbOnMes = undefined ){
    
    let wss = undefined;
    
    if( nconfig.https == true ){
        cl(`[i] Server WSS [${nconfig.name}] running at WSS://${nconfig.wsHOST}:${nconfig.wsPORT}/fooWSS`);
        wss = new WebSocket.Server({noServer: true});
    }else{
        cl(`[i] Server WS [${nconfig.name}] running at ws://${nconfig.wsHOST}:${nconfig.wsPORT}`);
        wss = new WebSocket.Server({host:nconfig.wsHOST ,port:nconfig.wsPORT});
    }

    wss.on('connection', ws => {
        

        if( cbOnMes != undefined )
            cbOnMes( ws, 'on_connection' );

        wsAllClients( wss );
        // Send a welcome message to the newly connected client
        ws.send('{"topic":"welcome","msg":"Welcome to the WebSocket server!"}');

        
        
        ws.on('message', message => {
            if( cbOnMes != undefined )
                cbOnMes( ws, 'on_message', message );
            else
                cl(`[${nconfig.name}] Received message from client: ${message}`);
            // Echo the message back to the client
            //ws.send(`Server received: ${message}`);
        });

        
        
        ws.on('close', () => {
            cl(`Client disconnected [${nconfig.name}] running at ws://${nconfig.wsHOST}:${nconfig.wsPORT}`);
            if( cbOnMes != undefined )
                cbOnMes( ws, 'on_close' );

        });



        ws.on('error', error => {
            console.error('WebSocket error:', error);
        });


    });


    return wss;
}


// ----------ws end

module.exports = { getWsInstance, sendToAll, closeAll, wsClientsOnline };