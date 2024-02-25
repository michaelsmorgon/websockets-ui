import { RoomInfo, RoomPlayer } from './constants';

let lastRoomIndex = 0;

export class Room {
  private id: number;
  private roomPlayers: RoomPlayer[] = [];

  constructor(indexRoom?: number) {
    if (indexRoom) {
      this.id = indexRoom;
    } else {
      this.id = ++lastRoomIndex;
    }
  }

  public getId = (): number => {
    return this.id;
  };

  public addUserToRoom = (userName: string, userIndex: number, roomList: Map<number, RoomInfo>): void => {
    const findRoom = roomList.get(this.id);
    if (findRoom) {
      const inRoom = findRoom?.roomUsers.find(
        (roomPlayer) => roomPlayer.name === userName && roomPlayer.index === userIndex,
      );
      if (inRoom) {
        return;
      }
      this.roomPlayers.push({
        name: userName,
        index: userIndex,
      });
      const newRoom = {
        roomId: findRoom.roomId,
        roomUsers: [...findRoom.roomUsers, ...this.roomPlayers],
      };
      roomList.delete(this.id);
      roomList.set(this.id, newRoom);
      return;
    }
    this.roomPlayers.push({
      name: userName,
      index: userIndex,
    });
    roomList.set(this.id, {
      roomId: this.id,
      roomUsers: this.roomPlayers,
    });
  };

  public removeRoom = (roomList: Map<number, RoomInfo>, indexRoom: number): void => {
    roomList.delete(indexRoom);
  };
}
