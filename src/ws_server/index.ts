import { WebSocket } from 'ws';
import { Format, MessageType } from './constants';

export const connectionHandler = (ws: WebSocket) => {
  ws.on('message', (request: string) => {
    console.log('received: %s', request);
    const { type, data } = JSON.parse(request) as Format;

    console.log('type: %s', type);
    console.log('data: %s', data);

    switch (type) {
      case MessageType.REG:
        
        break;
    }
  });
}

