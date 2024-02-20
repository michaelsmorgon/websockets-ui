import { IRoomData } from "./constants";

let lastRoomIndex = 0;

export class Room {
  private indexRoom: number;

  constructor(indexRoom?: number) {
    if (indexRoom) {
      this.indexRoom = indexRoom;
    } else {
      this.indexRoom = ++lastRoomIndex;
    }
  }

  public addNew = (userName: string, userIndex: number): IRoomData => {
    return {
      roomId: this.indexRoom,
      roomUsers: [{
        name: userName,
        index: userIndex
      }]
    }
  }
}
