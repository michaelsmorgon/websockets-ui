import { WebSocket } from 'ws';
import * as list from './constants';
import { Player, PlayerStore } from './Player';
import {
  sendCreateGame,
  sendCreatePlayer,
  sendUpdateRoom,
  sendUpdateRoomForAll,
  sendUpdateWinners,
} from './controller';
import { Room } from './Room';
import { Game, GameStore } from './Game';
import { parseData, parseRequest } from './utils';

const playerList: PlayerStore[] = [];
const roomList: list.RoomInfo[] = [];
const winnersList: list.Winner[] = [];
const gameList: GameStore[] = [];

export const connectionHandler = (ws: WebSocket): void => {
  let player: Player;
  let room: Room;
  let game: Game;

  ws.on('message', (request: string): void => {
    console.log('received: %s', request);
    const { type, data } = parseRequest(request);

    switch (type) {
      case list.MessageType.REG:
        const body = parseData(data, type) as list.LoginReq;
        player = new Player(body.name, body.password, ws);
        player.validate(playerList);
        sendCreatePlayer(player.getRegObj(), ws);

        if (!player.isError()) {
          sendUpdateRoom(roomList, ws);
          sendUpdateWinners(winnersList, ws);
        }
        break;
      case list.MessageType.CREATE_ROOM:
        if (!room) {
          room = new Room();
          room.addUserToRoom(player.getName(), player.getId(), roomList);
        }
        sendUpdateRoom(roomList, ws);
        break;
      case list.MessageType.ADD_USER_TO_ROOM:
        const { indexRoom } = JSON.parse(data) as list.RoomIndex;
        room = new Room(indexRoom);
        room.addUserToRoom(player.getName(), player.getId(), roomList);
        const findRoom = roomList.find((elem) => elem.roomId === indexRoom);
        if (findRoom?.roomUsers.length === 2) {
          game = new Game();
          findRoom.roomUsers.forEach((user) => {
            const playerInfo = playerList.find((player) => player.index! === user.index);
            sendCreateGame(game.createNew(user.index), playerInfo?.ws!);
          });
          gameList.push({
            idGame: game.getIdGame(),
            players: game.getPlayers(),
          });
          room.removeRoom(roomList, indexRoom);
          sendUpdateRoomForAll(roomList, playerList);
        }

        break;
    }
  });

  ws.on('error', console.error);

  ws.on('close', () => {
    if (player) {
      player.removePlayerSession(playerList);
    }
    if (room) {
      room.removeRoom(roomList, room.getId());
    }
    // check game if exist need to add win for enemy
  });
};
