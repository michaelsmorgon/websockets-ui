import * as list from './constants';

export const sendCreatePlayer = (data: list.IPlayer): string => {
  const obj: list.IFormat = {
    type: list.MessageType.REG,
    data: JSON.stringify(data),
    id: 0
  };
  const response = JSON.stringify(obj);
  console.log('Reg response: ', response);

  return response;
}

export const sendUpdateRoom = (data: list.IRoomData[]): string => {
  const obj: list.IFormat = {
    type: list.MessageType.UPDATE_ROOM,
    data: JSON.stringify(data),
    id: 0
  };
  const response = JSON.stringify(obj);
  console.log('Update Room response: ', response);
  return response;
}

export const sendUpdateWinners = (data: list.IWinner[]): string => {
  const obj: list.IFormat = {
    type: list.MessageType.UPDATE_WINNERS,
    data: JSON.stringify(data),
    id: 0
  };
  const response = JSON.stringify(obj);
  console.log('Update Winners response: ', response);
  return response;
}
