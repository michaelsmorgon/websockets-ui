import { WebSocket } from 'ws';
import * as list from './constants';
import { Player, PlayerStore } from './Player';
import { sendCreateGame, sendCreatePlayer, sendUpdateRoomForAll, sendUpdateWinners } from './controller';
import { Room } from './Room';
import { Game, GameStore } from './Game';
import { parseData, parseRequest } from './utils';

const playerList: Map<string, PlayerStore> = new Map();
const roomList: Map<number, list.RoomInfo> = new Map();
const winnersList: list.Winner[] = [];
const gameList: Map<number, GameStore> = new Map();
const connectionList: Map<number, WebSocket> = new Map();
const attackShipsList: Map<number, list.AttackShips> = new Map();
const turnPlayerId: list.TurnPlayerId = { value: null };

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
          connectionList.set(player.getId(), ws);
          sendUpdateRoomForAll([...roomList.values()], playerList);
          sendUpdateWinners(winnersList, ws);
        }
        break;
      case list.MessageType.CREATE_ROOM:
        if (!room || !room.getId()) {
          room = new Room();
          room.addUserToRoom(player.getName(), player.getId(), roomList);
        }
        sendUpdateRoomForAll([...roomList.values()], playerList);
        break;
      case list.MessageType.ADD_USER_TO_ROOM:
        const { indexRoom } = JSON.parse(data) as list.RoomIndex;
        let oldRoomId = null;
        if (room) {
          oldRoomId = room.getId();
        }
        room = new Room(indexRoom);
        room.addUserToRoom(player.getName(), player.getId(), roomList);
        const findRoom = roomList.get(indexRoom);
        if (findRoom?.roomUsers.length === 2) {
          game = new Game(gameList);
          findRoom.roomUsers.forEach((user) => game.addUser(user.index, gameList));
          const response = game.getCreateGameObj(gameList);

          response.forEach((elem) => {
            playerList.forEach((player) => {
              if (player && player?.ws && player.index === elem.idPlayer) {
                sendCreateGame(elem, player?.ws);
              }
            });
          });
          room.removeRoom(roomList, indexRoom);
          if (oldRoomId) {
            room.removeRoom(roomList, oldRoomId);
          }
          sendUpdateRoomForAll([...roomList.values()], playerList);
        }

        break;
      case list.MessageType.ADD_SHIPS:
        const addShipReq = JSON.parse(data) as list.AddShipsReq;
        if (!game) {
          game = new Game(gameList, addShipReq.gameId);
        }
        game.addShips(addShipReq, gameList, attackShipsList);
        game.gameStartIfReady(gameList, connectionList, player.getId(), turnPlayerId);
        break;
      case list.MessageType.ATTACK:
      case list.MessageType.RANDOM_ATTACK:
        const attackReq = JSON.parse(data) as list.AttackReq;
        game.attack(gameList, attackShipsList, connectionList, winnersList, playerList, attackReq, turnPlayerId);
        break;
    }
  });

  ws.on('error', console.error);

  ws.on('close', () => {
    if (player) {
      connectionList.delete(player.getId());
      attackShipsList.delete(player.getId());
      player.removePlayerSession(playerList);
    }
    if (room) {
      room.removeRoom(roomList, room.getId());
    }
    // check game if exist need to add win for enemy
  });
};
