
const WebSocket = require('ws');


function cl(str){
    console.log('sWS ', str);
}


// --------- ws 
// https://github.com/websockets/ws/blob/master/doc/ws.md

function wsAllClients( ws ){
    let c = 0;
    ws.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
        //client.send(data, { binary: isBinary });
        c++;
        }
    });
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
    cl(`[i] Server WS [${nconfig.name}] running at ws://${nconfig.wsHOST}:${nconfig.wsPORT}`);
    let wss = new WebSocket.Server({host:nconfig.wsHOST ,port:nconfig.wsPORT});
    wss.on('connection', ws => {
        cl('New client connected');

        if( cbOnMes != undefined )
            cbOnMes( ws, 'on_connection' );

        wsAllClients( wss );
        // Send a welcome message to the newly connected client
        ws.send('{"topic":"welcome","msg":"Welcome to the WebSocket server!"}');

        ws.on('message', message => {
            cl(`[${nconfig.name}] Received message from client: ${message}`);
            if( cbOnMes != undefined )
                cbOnMes( ws, 'on_message', message );
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

module.exports = { getWsInstance, sendToAll, closeAll };