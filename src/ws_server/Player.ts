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

  public validate = (playerList: Map<string, PlayerStore>): void => {
    const hasName = playerList.has(this.name);

    if (hasName) {
      const player = playerList.get(this.name);
      if (!player) {
        return;
      }
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
    playerList.set(this.name, this.getPlayer());
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

  public removePlayerSession = (playerList: Map<string, PlayerStore>): void => {
    if (playerList.has(this.name)) {
      playerList.delete(this.name);
    }
  };
}
