import { WebSocketServer } from 'ws';
import { httpServer } from './src/http_server/index';
import { connectionHandler } from './src/ws_server/index';

const HTTP_PORT = 8181;
const WEB_SOCKET_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

console.log(`Start Web Socket Server on the ${WEB_SOCKET_PORT} port!`);
const wsServer = new WebSocketServer({ port: WEB_SOCKET_PORT, clientTracking: true });

wsServer.on('connection', connectionHandler);
