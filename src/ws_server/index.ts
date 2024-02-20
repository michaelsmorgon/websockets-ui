import { WebSocket } from 'ws';
import { IFormat, ILoginData, MessageType, ISavingPlayer } from './constants';
import { Player } from './Player';
import { createPlayer } from './controller';

const playerList: ISavingPlayer[] = [];

export const connectionHandler = (ws: WebSocket) => {
  let player: Player;
  ws.on('message', (request: string) => {
    console.log('received: %s', request);
    const { type, data } = JSON.parse(request) as IFormat;

    console.log('PlayerList: %s', playerList);

    switch (type) {
      case MessageType.REG:
        player = new Player(JSON.parse(data) as ILoginData);
        const isValid = player.isValid(playerList);
        if (isValid) {
          playerList.push(player.getPlayer());
        }
        ws.send(createPlayer(player.getRegObj()));

        if (isValid) {

        }
        break;
    }
  });
}

