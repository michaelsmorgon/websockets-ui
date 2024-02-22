import { WebSocket } from 'ws';
import { AddShipsReq, AttackRes, CreateGameRes, Ship, StartGameRes } from './constants';
import { sendStartGame, sendTurn } from './controller';

let lastGameIndex = 0;

export interface GamePlayers {
  idPlayer: number;
  ships: Ship[];
  attack: AttackRes[];
}

export interface GameStore {
  idGame: number;
  players: GamePlayers[];
  started: boolean;
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
        started: false,
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
      })
    });

    return obj;
  }

  public addUser = (idPlayer: number, gameList: Map<number, GameStore>): void => {
    const gameInfo = gameList.get(this.idGame);
    if (gameInfo) {
      gameInfo.players.push({
        idPlayer: idPlayer,
        ships: [],
        attack: [],
      });
      gameList.set(this.idGame, gameInfo);
    }
  };

  public addShips = (shipReq: AddShipsReq, gameList: Map<number, GameStore>): void => {
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
    }
  }

  public gameStartIfReady = (gameList: Map<number, GameStore>, connectionList: Map<number, WebSocket>, playerId: number): void => {
    const infoGame = gameList.get(this.idGame);
    const readyPlayersCnt = infoGame?.players.reduce((acc, val) => {
      if (val.ships.length) {
        return acc + 1;
      }
      return acc;
    }, 0);
    if (readyPlayersCnt === 2) {
      infoGame?.players.forEach((elem) => {
        const obj: StartGameRes = {
          ships: elem.ships,
          currentPlayerIndex: elem.idPlayer
        }
        sendStartGame(obj, connectionList.get(elem.idPlayer)!);
        sendTurn({ currentPlayer: playerId }, connectionList.get(elem.idPlayer)!);
      });
    };
  }
}
