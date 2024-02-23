import { WebSocket } from 'ws';
import * as list from './constants';
import { PlayerStore } from './Player';

export const sendCreatePlayer = (data: list.PlayerRes, ws: WebSocket): void => {
  const response = getObj(list.MessageType.REG, JSON.stringify(data));
  ws.send(response);
  console.log('Reg response: ', response);
};

export const sendUpdateRoom = (data: list.RoomInfo[], ws: WebSocket, showMsg = true): void => {
  const response = getObj(list.MessageType.UPDATE_ROOM, JSON.stringify(data));
  ws.send(response);
  if (showMsg) {
    console.log('Update Room response: ', response);
  }
};

export const sendUpdateRoomForAll = (data: list.RoomInfo[], playerList: Map<string, PlayerStore>): void => {
  let showMsg = true;
  playerList.forEach((player) => {
    if (player.ws) {
      sendUpdateRoom(data, player.ws, showMsg);
      showMsg = false;
    }
  });
};

export const sendUpdateWinners = (data: list.Winner[], ws: WebSocket, showMsg = true): void => {
  const response = getObj(list.MessageType.UPDATE_WINNERS, JSON.stringify(data));
  ws.send(response);
  if (showMsg) {
    console.log('Update Winners response: ', response);
  }
};

export const sendUpdateWinnersForAll = (data: list.Winner[], playerList: PlayerStore[]): void => {
  let showMsg = true;
  playerList.forEach((player) => {
    if (player.ws) {
      sendUpdateWinners(data, player.ws, showMsg);
      showMsg = false;
    }
  });
};

export const sendCreateGame = (data: list.CreateGameRes, ws: WebSocket): void => {
  const response = getObj(list.MessageType.CREATE_GAME, JSON.stringify(data));
  ws.send(response);
  console.log('Create Game response: ', response);
};

export const sendStartGame = (data: list.StartGameRes, ws: WebSocket): void => {
  const response = getObj(list.MessageType.START_GAME, JSON.stringify(data));
  ws.send(response);
  console.log('Start Game response: ', response);
};

export const sendTurn = (data: list.Turn, ws: WebSocket): void => {
  const response = getObj(list.MessageType.TURN, JSON.stringify(data));
  ws.send(response);
  console.log('Turn response: ', response);
};

export const sendAttackRes = (data: list.AttackRes, ws: WebSocket): void => {
  const response = getObj(list.MessageType.ATTACK, JSON.stringify(data));
  ws.send(response);
  console.log('Attack response: ', response);
};

const getObj = (type: string, data: string): string => {
  const obj: list.FormatMsg = {
    type: type,
    data: data,
    id: 0,
  };
  return JSON.stringify(obj);
};
