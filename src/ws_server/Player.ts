import { WebSocket } from 'ws';
import { PlayerRes } from './constants';

let lastUserIndex = 0;

export interface PlayerStore {
  index?: number;
  name: string;
  password: string;
  wins: number;
  ws?: WebSocket;
}

export class Player {
  private name: string = '';
  private password: string = '';
  private error: boolean = false;
  private errorText: string = '';
  private index: number;
  private ws: WebSocket;
  private wins: number = 0;

  constructor(name: string, password: string, ws: WebSocket) {
    this.name = name;
    this.password = password;
    this.ws = ws;
  }

  public getId = (): number => {
    return this.index;
  };

  public getName = (): string => {
    return this.name;
  };

  public isError = (): boolean => {
    return this.error;
  };

  public validate = (playerList: PlayerStore[]): void => {
    const player = playerList.find((elem) => {
      return elem.name === this.name;
    });

    if (player) {
      if (player.password !== this.password) {
        this.error = true;
        this.errorText = 'Login or Password is Incorrect';
        return;
      }
      if (player.index) {
        this.error = true;
        this.errorText = 'You signed in with another tab or window';
        return;
      }
      this.wins = player.wins;
      this.index = ++lastUserIndex;

      return;
    }

    this.index = ++lastUserIndex;
    playerList.push(this.getPlayer());
  };

  public getPlayer = (): PlayerStore => {
    return {
      index: this.index,
      name: this.name,
      password: this.password,
      ws: this.ws,
      wins: this.wins,
    };
  };

  public getRegObj = (): PlayerRes => {
    return {
      index: this.index,
      name: this.name,
      error: this.error,
      errorText: this.errorText,
    };
  };

  public removePlayerSession = (playerList: PlayerStore[]): void => {
    const playerInfo = playerList.find((elem) => elem.index === this.index);
    const index = playerList.findIndex((elem) => elem.index === this.index);

    if (playerInfo) {
      const exitPlayer: PlayerStore = {
        name: playerInfo.name,
        password: playerInfo.password,
        wins: playerInfo.wins,
      };
      playerList.splice(index, 1, exitPlayer);
    }
  };
}
