export enum MessageType {
  REG = 'reg',
  UPDATE_WINNERS = 'update_winners',
  CREATE_ROOM = 'create_room',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  CREATE_GAME = 'create_game',
  UPDATE_ROOM = 'update_room',
  ADD_SHIPS = 'add_ships',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
  TURN = 'turn',
  FINISH = 'finish',
}

export enum ShipType {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  HUGE = 'huge',
}

export enum AttackStatus {
  MISS = 'miss',
  KILLED = 'killed',
  SHOT = 'shot',
}

export interface IFormat {
  type: string,
  data: string,
  id: number,
}

export interface ILoginData {
  name: string,
  password: string,
}

export interface ISavingPlayer {
  name: string,
  index: number,
  password: string,
}

export interface IPlayer {
  name: string,
  index: number,
  error: boolean,
  errorText: string,
}

export interface IRoomData {
  roomId: number,
  roomUsers: {
    name: string,
    index: number
  }[],
}

export interface IWinner {
  name: string,
  wins: number,
}
