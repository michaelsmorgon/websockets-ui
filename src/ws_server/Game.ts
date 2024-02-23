import { WebSocket } from 'ws';
import { AddShipsReq, AttackReq, AttackRes, AttackStatus, CoordinatesShips, CreateGameRes, Position, Ship, StartGameRes, TurnPlayerId, AttackShips } from './constants';
import { sendAttackRes, sendStartGame, sendTurn } from './controller';

let lastGameIndex = 0;

export interface GamePlayers {
  idPlayer: number;
  ships: Ship[];
}

export interface GameStore {
  idGame: number;
  players: GamePlayers[];
}

export class Game {
  private idGame: number;

  constructor(gameList: Map<number, GameStore>, idGame?: number) {
    if (idGame) {
      this.idGame = idGame;
    } else {
      this.idGame = ++lastGameIndex;
      gameList.set(this.idGame, {
        idGame: this.idGame,
        players: [],
      });
    }
  }

  public getCreateGameObj = (gameList: Map<number, GameStore>): CreateGameRes[] => {
    const obj: CreateGameRes[] = [];
    const gameInfo = gameList.get(this.idGame);
    gameInfo?.players.forEach((elem): void => {
      obj.push({
        idGame: this.idGame,
        idPlayer: elem.idPlayer,
      });
    });

    return obj;
  };

  public addUser = (idPlayer: number, gameList: Map<number, GameStore>): void => {
    const gameInfo = gameList.get(this.idGame);
    if (gameInfo) {
      gameInfo.players.push({
        idPlayer: idPlayer,
        ships: [],
      });
      gameList.set(this.idGame, gameInfo);
    }
  };

  public addShips = (
    shipReq: AddShipsReq,
    gameList: Map<number, GameStore>,
    attackShipsList: Map<number, AttackShips>
  ): void => {
    if (this.idGame === shipReq.gameId) {
      const gameInfo = gameList.get(this.idGame);
      const indexPlayer = gameInfo?.players.findIndex((elem) => elem.idPlayer === shipReq.indexPlayer);
      if (indexPlayer !== undefined && indexPlayer !== -1 && gameInfo) {
        gameInfo?.players.splice(indexPlayer, 1, {
          ...gameInfo?.players[indexPlayer]!,
          ships: shipReq.ships
        });
        gameList.set(this.idGame, gameInfo);
      }
      const coordinatesShips: CoordinatesShips[] = [];
      shipReq.ships.forEach((shipData) => {
        const x = shipData.position.x;
        const y = shipData.position.y;
        const length = shipData.length;
        const ship: Map<string, Position> = new Map();
        const emptyCell = this.fillEmptyCell(shipData);
        if (shipData.direction) {
          for (let i = y; i < y + length; i = i + 1) {
            const key = `${x}${i}`;
            ship.set(key, { x: x, y: i });
          }
        } else {
          for (let i = x; i < x + length; i = i + 1) {
            const key = `${i}${y}`;
            ship.set(key, { x: i, y: y });
          }
        }
        coordinatesShips.push({
          coordinates: ship,
          compartmentsCnt: length,
          emptyCell: emptyCell,
        });
      });
      attackShipsList.set(shipReq.indexPlayer, {
        coordinatesShips: coordinatesShips,
        attack: [],
      });
    }
  };

  public gameStartIfReady = (
    gameList: Map<number, GameStore>,
    connectionList: Map<number, WebSocket>,
    playerId: number,
    turnPlayerId: TurnPlayerId,
  ): void => {
    const infoGame = gameList.get(this.idGame);
    const readyPlayersCnt = infoGame?.players.reduce((acc, val) => {
      if (val.ships.length) {
        return acc + 1;
      }
      return acc;
    }, 0);
    if (readyPlayersCnt === 2) {
      turnPlayerId.value = playerId;
      const wsList: WebSocket[] = [];
      infoGame?.players.forEach((elem) => {
        const obj: StartGameRes = {
          ships: elem.ships,
          currentPlayerIndex: elem.idPlayer,
        };

        const ws = connectionList.get(elem.idPlayer);
        if (ws) {
          wsList.push(ws);
          sendStartGame(obj, ws);
        }
      });
      wsList.forEach((ws) => {
        sendTurn({ currentPlayer: playerId }, ws);
      })
    }
  };

  public attack(
    gameList: Map<number, GameStore>,
    attackShipsList: Map<number, AttackShips>,
    connectionList: Map<number, WebSocket>,
    attackReq: AttackReq,
    turnPlayerId: TurnPlayerId,
  ): void {
    if (turnPlayerId.value !== attackReq.indexPlayer) {
      return;
    }
    const gameInfo = gameList.get(attackReq.gameId);
    if (!gameInfo?.players) {
      return;
    }
    const currentPlayer = gameInfo.players.find((elem) => elem.idPlayer === attackReq.indexPlayer);
    const enemy = gameInfo.players.find((elem) => elem.idPlayer !== attackReq.indexPlayer);
    if (!currentPlayer?.idPlayer || !enemy?.idPlayer) {
      return;
    }
    const currentWS = connectionList.get(currentPlayer?.idPlayer);
    const enemyWS = connectionList.get(enemy?.idPlayer);
    if (!currentWS || !enemyWS) {
      return;
    }
    const currentPlayerShips = attackShipsList.get(currentPlayer.idPlayer);
    const enemyShips = attackShipsList.get(enemy.idPlayer);
    if (!currentPlayerShips || !enemyShips) {
      return;
    }
    if (attackReq.x === undefined || attackReq.y === undefined) {
      const { x, y } = this.getRandomShot(currentPlayerShips);
      attackReq.x = x;
      attackReq.y = y;
    }
    const isDuplicateShot = currentPlayerShips?.attack.findIndex((elem) => elem === `${attackReq.x}${attackReq.y}`);
    if (isDuplicateShot !== -1) {
      return;
    }

    currentPlayerShips.attack.push(`${attackReq.x}${attackReq.y}`);
    attackShipsList.set(currentPlayer.idPlayer, currentPlayerShips);

    const enemyShipIndex = enemyShips.coordinatesShips.findIndex((coordinates) => {
      return coordinates.coordinates.has(`${attackReq.x}${attackReq.y}`);
    })
    if (enemyShipIndex === -1) {
      const res: AttackRes = {
        position: {
          x: attackReq.x,
          y: attackReq.y,
        },
        currentPlayer: attackReq.indexPlayer,
        status: AttackStatus.MISS
      };
      sendAttackRes(res, currentWS);
      sendAttackRes(res, enemyWS);
      sendTurn({ currentPlayer: enemy.idPlayer }, currentWS);
      sendTurn({ currentPlayer: enemy.idPlayer }, enemyWS);
      turnPlayerId.value = enemy.idPlayer;
      return;
    }
    const attackedShip = enemyShips.coordinatesShips[enemyShipIndex];
    if (!attackedShip) {
      return;
    }
    if (attackedShip.compartmentsCnt > 1) {
      const res: AttackRes = {
        position: {
          x: attackReq.x,
          y: attackReq.y,
        },
        currentPlayer: attackReq.indexPlayer,
        status: AttackStatus.SHOT
      }

      enemyShips.coordinatesShips.splice(enemyShipIndex, 1, {
        ...attackedShip,
        compartmentsCnt: attackedShip.compartmentsCnt - 1,
      });

      attackShipsList.set(enemy.idPlayer, {
        ...enemyShips
      });
      sendAttackRes(res, currentWS);
      sendAttackRes(res, enemyWS);
      sendTurn({ currentPlayer: currentPlayer.idPlayer }, currentWS);
      sendTurn({ currentPlayer: currentPlayer.idPlayer }, enemyWS);
    }
    if (attackedShip.compartmentsCnt === 1) {
      attackedShip.coordinates.forEach((elem) => {
        const res: AttackRes = {
          position: {
            x: elem.x,
            y: elem.y,
          },
          currentPlayer: attackReq.indexPlayer,
          status: AttackStatus.KILLED
        };
        sendAttackRes(res, currentWS);
        sendAttackRes(res, enemyWS);
      });
      const currentPlayerShips = attackShipsList.get(currentPlayer.idPlayer);
      attackedShip.emptyCell.forEach((elem) => {
        currentPlayerShips?.attack.push(`${elem.x}${elem.y}`);
        const res: AttackRes = {
          position: {
            x: elem.x,
            y: elem.y,
          },
          currentPlayer: attackReq.indexPlayer,
          status: AttackStatus.MISS
        };
        sendAttackRes(res, currentWS);
        sendAttackRes(res, enemyWS);
      });
      if (currentPlayerShips) {
        attackShipsList.set(currentPlayer.idPlayer, currentPlayerShips);
      }
      sendTurn({ currentPlayer: currentPlayer.idPlayer }, currentWS);
      sendTurn({ currentPlayer: currentPlayer.idPlayer }, enemyWS);
    }
  }

  private fillEmptyCell = (shipData: Ship): Map<string, Position> => {
    const x = shipData.position.x;
    const y = shipData.position.y;
    const length = shipData.length;
    const emptyCell: Map<string, Position> = new Map();
    if (shipData.direction) {
      for (let i = y - 1; i < y + length + 1; i = i + 1) {
        if (this.isCell(x - 1, i)) {
          const key = `${x - 1}${i}`;
          emptyCell.set(key, { x: x - 1, y: i });
        }
        if (this.isCell(x + 1, i)) {
          const key = `${x + 1}${i}`;
          emptyCell.set(key, { x: x + 1, y: i });
        }
      }
      if (this.isCell(x, y - 1)) {
        const key = `${x}${y - 1}`;
        emptyCell.set(key, { x: x, y: y - 1 });
      }
      if (this.isCell(x, y + length)) {
        const key = `${x}${y + length}`;
        emptyCell.set(key, { x: x, y: y + length });
      }
    } else {
      for (let i = x - 1; i < x + length + 1; i = i + 1) {
        if (this.isCell(i, y - 1)) {
          const key = `${i}${y - 1}`;
          emptyCell.set(key, { x: i, y: y - 1 });
        }
        if (this.isCell(i, y + 1)) {
          const key = `${i}${y + 1}`;
          emptyCell.set(key, { x: i, y: y + 1 });
        }
      }
      if (this.isCell(x - 1, y)) {
        const key = `${x - 1}${y}`;
        emptyCell.set(key, { x: x - 1, y: y });
      }
      if (this.isCell(x + length, y)) {
        const key = `${x + length}${y}`;
        emptyCell.set(key, { x: x + length, y: y });
      }
    }

    return emptyCell;
  };

  private isCell(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < 10 && y < 10;
  }

  private getRandomShot(currentPlayerShips: AttackShips): Position {
    let isExist = true;
    let counter = 1000;
    let x: number;
    let y: number;
    do {
      x = this.getRandomValue();
      y = this.getRandomValue();
      const duplicateShot = currentPlayerShips?.attack.find((elem) => elem === `${x}${y}`);
      if (!duplicateShot) {
        isExist = false;
      }
      counter--;
    } while (isExist && counter > 0);
    return  { x, y };
  }

  private getRandomValue = (min = 0, max = 9)  => {
    return Math.floor(Math.random() * (max - min) + min);
  }

}