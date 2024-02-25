import { FormatMsg, LoginReq, MessageType, RoomIndex, Ship, ShipType } from './constants';

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

export const getRandomValue = (min = 0, max = 9): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getBotShips = (): Ship[] => {
  const ships: Ship[] = [];
  const x = getRandomValue(0, 6);
  const y = getRandomValue(0, 6);
  const hugeLength = 4;
  const direction = !!getRandomValue(0, 1);
  const hugeShip: Ship = {
    position: {
      x: x,
      y: y,
    },
    direction: direction,
    length: hugeLength,
    type: ShipType.HUGE,
  };
  ships.push(hugeShip);

  let shipCnt = 2;
  for (let length = 3; length > 0; length = length - 1) {
    let shipType = ShipType.LARGE;
    switch (shipCnt) {
      case 2:
        shipType = ShipType.LARGE;
        break;
      case 3:
        shipType = ShipType.MEDIUM;
        break;
      case 4:
        shipType = ShipType.SMALL;
        break;
    }
    for (let i = 0; i < shipCnt; i = i + 1) {
      ships.push(getShip(ships, length, shipType));
    }
    shipCnt = shipCnt + 1;
  }
  return ships;
};

const getShip = (ships: Ship[], length: number, shipType: ShipType): Ship => {
  let findPosition = false;
  let cycleExit = 10000;
  let x = 0;
  let y = 0;
  let direction = false;
  while (!findPosition && cycleExit > 0) {
    x = getRandomValue(0, 9);
    y = getRandomValue(0, 9);
    direction = !!getRandomValue(0, 1);
    let finishPosX = x + length - 1;
    let finishPosY = y;
    if (direction) {
      finishPosX = x;
      finishPosY = y + length - 1;
    }
    const posFind: boolean[] = [];
    ships.find((elem) => {
      const startX = elem.position.x - 1;
      const startY = elem.position.y - 1;
      let finishX = elem.position.x + elem.length;
      let finishY = elem.position.y + 1;
      if (elem.direction) {
        finishX = elem.position.x + 1;
        finishY = elem.position.y + elem.length;
      }
      if (
        finishPosX < 10 &&
        finishPosY < 10 &&
        (y > finishY || x > finishX || finishPosX < startX || finishPosY < startY)
      ) {
        posFind.push(true);
      } else {
        posFind.push(false);
      }
    });
    const index = posFind.findIndex((value) => !value);
    if (index === -1) {
      findPosition = true;
    }
    cycleExit = cycleExit - 1;
  }
  return {
    position: {
      x: x,
      y: y,
    },
    direction: direction,
    length: length,
    type: shipType,
  };
};
