import { MapSchema, Schema, type } from "@colyseus/schema";

export interface InputData {
  left: false;
  right: false;
  up: false;
  tick: number;
  face: string;
  shoot: false;
}

export class Player extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("number") tick: number;
  @type("string") name: string;
  @type("number")
  vx = 0;

  @type("number")
  vy = 0;

  @type("string") face: string;

  inputQueue: InputData[] = [];
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  createPlayer(sessionId: string) {
    const newPlayer = new Player();
    newPlayer.name = sessionId;
    this.players.set(sessionId, newPlayer);
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
  }
}
