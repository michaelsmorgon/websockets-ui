import { IFormat, IPlayer, MessageType } from './constants';

export const createPlayer = (data: IPlayer): string => {
  const obj: IFormat = {
    type: MessageType.REG,
    data: JSON.stringify(data),
    id: 0
  }
  return JSON.stringify(obj);
}