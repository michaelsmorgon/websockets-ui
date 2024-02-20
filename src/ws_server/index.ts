import { WebSocket } from 'ws';
import * as list from './constants';
import { Player } from './Player';
import { sendCreatePlayer, sendUpdateRoom, sendUpdateWinners } from './controller';
import { Room } from './Room';

const playerList: list.ISavingPlayer[] = [];
const roomList: list.IRoomData[] = [];
const winnersList: list.IWinner[] = [];

export const connectionHandler = (ws: WebSocket) => {
  let player: Player;
  let room: Room;
  ws.on('message', (request: string) => {
    console.log('received: %s', request);
    const { type, data } = JSON.parse(request) as list.IFormat;

    console.log('PlayerList: %s', playerList);

    switch (type) {
      case list.MessageType.REG:
        player = new Player(JSON.parse(data) as list.ILoginData);
        const isValid = player.isValid(playerList);
        if (isValid) {
          playerList.push(player.getPlayer());
        }
        ws.send(sendCreatePlayer(player.getRegObj()));

        if (isValid) {
          ws.send(sendUpdateRoom(roomList));
          ws.send(sendUpdateWinners(winnersList));
        }
        break;
      case list.MessageType.CREATE_ROOM:
        room = new Room();
        const { name, index } = player.getPlayer();
        roomList.push(room.addNew(name, index));
        ws.send(sendUpdateRoom(roomList));
        break;
    }
  });
}

