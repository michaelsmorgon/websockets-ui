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

  public addUserToRoom = (userName: string, userIndex: number, roomList: RoomInfo[]): void => {
    const index = roomList.findIndex((elem) => {
      return elem.roomId === this.id;
    });
    if (index !== -1) {
      const inRoom = roomList[index]?.roomUsers.find(
        (roomPlayer) => roomPlayer.name === userName && roomPlayer.index === userIndex,
      );
      if (inRoom) {
        return;
      }
      this.roomPlayers.push({
        name: userName,
        index: userIndex,
      });
      const room = roomList[index];
      if (!room) {
        return;
      }
      roomList.splice(index, 1, {
        roomId: room.roomId,
        roomUsers: [...room.roomUsers, ...this.roomPlayers],
      });
      return;
    }
    this.roomPlayers.push({
      name: userName,
      index: userIndex,
    });
    roomList.push({
      roomId: this.id,
      roomUsers: this.roomPlayers,
    });
  };

  public removeRoom = (roomList: RoomInfo[], indexRoom: number): void => {
    const index = roomList.findIndex((elem) => elem.roomId === indexRoom);
    roomList.splice(index, 1);
  };
}
