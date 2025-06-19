import { string } from "zod";

export default class Player {
	private count = 0;
	private roomId = "";
	private socketId = "";

	constructor(socketId: string) {
		this.socketId = socketId;
	}

  getCount() {
    return this.count;
  }

	increment() {
		this.count++;
	}

	getRoomId() {
		return this.roomId;
	}

	setRoomId(roomId: string) {
		this.roomId = roomId;
	}

	getSocketId() {
		return this.socketId;
	}
}
