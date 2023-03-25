import { ArcadePhysics } from "arcade-physics";
import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { InputData, Player } from "./schema/PlayerSchema";

export class MyRoom extends Room<MyRoomState> {
  fixedTimeStep = 1000 / 60;
  physics: ArcadePhysics = null;

  onCreate(options: any) {
    this.setState(new MyRoomState());

    this.onMessage(0, (client, input) => {
      // handle player input
      const player = this.state.players.get(client.sessionId);

      // enqueue input to user input buffer.
      player.inputQueue.push(input);
    });

    const config = {
      width: 800,
      height: 600,
      gravity: {
        x: 0,
        y: 300,
      },
    };

    const physics = new ArcadePhysics(config);

    const platform1 = physics.add.staticBody(800, 568);
    const platform2 = physics.add.staticBody(600, 400);
    const platform3 = physics.add.staticBody(50, 250);
    const platform4 = physics.add.staticBody(750, 220);

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }
    });
  }

  fixedTick(timeStep: number) {
    const velocity = 2;

    this.state.players.forEach((player) => {
      let input: InputData;

      // dequeue player inputs
      while ((input = player.inputQueue.shift())) {
        if (input.left) {
          player.x -= velocity;
        } else if (input.right) {
          player.x += velocity;
        }

        if (input.up) {
          player.y -= 330;
        }

        player.tick = input.tick;
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const mapWidth = 800;
    const mapHeight = 600;

    const player = new Player();

    player.x = 500;
    player.y = 300;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
