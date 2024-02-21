import { IGameData } from './constants';

let lastGameIndex = 0;

export interface GameStore {
  idGame: number;
  players: {
    idPlayer: number;
  }[];
}

export class Game {
  private idGame: number;
  private players: {
    idPlayer: number;
  }[] = [];

  constructor() {
    this.idGame = ++lastGameIndex;
  }

  public getIdGame = (): number => {
    return this.idGame;
  };

  public getPlayers = (): { idPlayer: number }[] => {
    return this.players;
  };

  public createNew = (idPlayer: number): IGameData => {
    this.players.push({
      idPlayer: idPlayer,
    });
    return {
      idGame: this.idGame,
      idPlayer: idPlayer,
    };
  };
}
