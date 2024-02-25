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
  SINGLE_PLAY = 'single_play',
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

export interface FormatMsg {
  type: string;
  data: string;
  id: number;
}

export interface LoginReq {
  name: string;
  password: string;
}

export interface PlayerRes {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export interface RoomPlayer {
  name: string;
  index: number;
}

export interface RoomInfo {
  roomId: number;
  roomUsers: RoomPlayer[];
}

export interface Winner {
  name: string;
  wins: number;
}

export interface RoomIndex {
  indexRoom: number;
}

export interface CreateGameRes {
  idGame: number;
  idPlayer: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: ShipType;
}

export interface AddShipsReq {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
}

export interface StartGameRes {
  ships: Ship[];
  currentPlayerIndex: number;
}

export interface Turn {
  currentPlayer: number;
}

export interface AttackReq {
  gameId: number;
  x?: number;
  y?: number;
  indexPlayer: number;
}

export interface AttackRes {
  position: Position;
  currentPlayer: number;
  status: AttackStatus;
}

export interface FinishGameRes {
  winPlayer: number;
}

export interface CoordinatesShips {
  coordinates: Map<string, Position>;
  compartmentsCnt: number;
  emptyCell: Map<string, Position>;
}

export interface AttackShips {
  coordinatesShips: CoordinatesShips[];
  attack: string[];
  goals: number;
}

export interface TurnPlayerId {
  value: number | null;
}
