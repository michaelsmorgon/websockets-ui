import { FormatMsg, LoginReq, MessageType, RoomIndex } from './constants';

export const parseRequest = (request: string): FormatMsg => {
  return JSON.parse(request) as FormatMsg;
};

export const parseData = (data: string, requestType: string): LoginReq | RoomIndex | string => {
  switch (requestType) {
    case MessageType.REG:
      return JSON.parse(data) as LoginReq;
    case MessageType.ADD_USER_TO_ROOM:
      return JSON.parse(data) as RoomIndex;
    default:
      return '';
  }
};
