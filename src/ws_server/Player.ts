import { ILoginData, IPlayer, ISavingPlayer } from "./constants";

let lastUserIndex = 0;

export class Player {
  private name: string = '';
  private password: string = '';
  private error: boolean = false;
  private errorText: string = '';
  private index: number;
  constructor(login: ILoginData) {
    this.name = login.name;
    this.password = login.password;
  }

  public isValid = (playerList: ISavingPlayer[]): boolean => {
    const player = playerList.find((elem) => {
      return elem.name === this.name;
    });

    if (!player) {
      this.index = ++lastUserIndex;
      return true;
    }

    this.index = player.index;
    if (player.password !== this.password) {
      this.error = true;
      this.errorText = 'Login or Password is Incorrect';

      return false;
    }

    return true;
  }

  public getPlayer = (): ISavingPlayer => {
    return {
      index: this.index,
      name: this.name,
      password: this.password,
    }
  }

  public getRegObj = (): IPlayer => {
    return {
      index: this.index,
      name: this.name,
      error: this.error,
      errorText: this.errorText
    };
  }
}
