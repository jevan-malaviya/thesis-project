import { MapSchema, Schema, Context, type } from "@colyseus/schema";
import { Player } from "./PlayerSchema";

export class MyRoomState extends Schema {
  @type("string") mySynchronizedProperty: string = "Hello world";
  @type({ map: Player }) players = new MapSchema<Player>();
}
