import { IFormat, IPlayer, MessageType } from './constants';

export const createPlayer = (data: IPlayer): IFormat => {
  const obj = {
    type: MessageType.REG,
    data: JSON.stringify(data),
    id: 0
  }
  return obj;
}