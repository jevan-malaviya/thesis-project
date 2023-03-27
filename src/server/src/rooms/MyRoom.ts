import { Room, Client } from "colyseus";
import { InputData, MyRoomState } from "./schema/MyRoomState";
import { GameEngine } from "../GameEngine";
import Matter from "matter-js";

export class MyRoom extends Room<MyRoomState> {
  fixedTimeStep = 1000 / 60;
  engine: GameEngine = null;

  onCreate(options: any) {
    this.setState(new MyRoomState());

    this.engine = new GameEngine(this.state);

    this.onMessage(0, (client, input) => {
      // handle player input
      const player = this.state.players.get(client.sessionId);

      // enqueue input to user input buffer.
      player.inputQueue.push(input);
    });

    // Game loop
    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.update(this.fixedTimeStep);
      }
    });
  }

  update(deltaTime: number) {
    this.state.players.forEach((player) => {
      let input: InputData;

      // dequeue player inputs
      while ((input = player.inputQueue.shift())) {
        this.engine.processPlayerAction(player.name, input);

        player.tick = input.tick;
      }
    });
    Matter.Engine.update(this.engine.engine, deltaTime);
  }

  onJoin(client: Client) {
    console.log(client.sessionId, "joined!");

    this.engine.addPlayer(client.sessionId);
  }

  onLeave(client: Client) {
    console.log(client.sessionId, "left!");
    this.engine.removePlayer(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
