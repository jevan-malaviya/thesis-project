import Matter, { Bodies, Body, Engine, World } from "matter-js";
import { MyRoomState } from "./rooms/schema/MyRoomState";

export class GameEngine {
  // Matter.js engine
  engine: Engine = null;

  // Matter.js world
  world: World = null;

  // Colyseus room state. Need to update whenever there are updates in the world.
  state: MyRoomState = null;

  // Some of the objects in the world we want to track/update
  players: any = {};

  constructor(state: MyRoomState) {
    this.state = state;

    this.engine = Matter.Engine.create({
      gravity: {
        y: 1,
      },
    });
    this.world = this.engine.world;
    this.init();
  }

  init() {
    // Add some boundary in our world
    Matter.Composite.add(this.world, [
      Bodies.rectangle(400, 600, 800, 142, { isStatic: true }),
    ]);

    this.initUpdateEvents();
    this.initCollisionEvents();
  }

  initUpdateEvents() {
    // Update events to sync bodies in the world to the state.
    Matter.Events.on(this.engine, "afterUpdate", () => {
      for (const name in this.players) {
        // Make sure we still have the player in the world or state.
        if (!this.state.players.get(name) || !this.players[name]) {
          continue;
        }
        this.state.players.get(name).x = this.players[name].position.x;
        this.state.players.get(name).y = this.players[name].position.y;
        this.state.players.get(name).vx = this.players[name].velocity.x;
        this.state.players.get(name).vy = this.players[name].velocity.y;
      }
    });
  }

  initCollisionEvents() {
    // The collision events
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      const pairs = event.pairs;
    });
  }

  addPlayer(sessionId: string) {
    const startX = 100;
    const startY = 100;
    const newPlayer = Matter.Bodies.rectangle(startX, startY, 32, 48, {
      isStatic: false,
      inertia: Infinity,
    });
    this.players[sessionId] = newPlayer;

    console.log("Add a player", startX, startY);

    // Add to world
    Matter.Composite.add(this.world, [newPlayer]);

    // Add to state
    this.state.createPlayer(sessionId);
  }

  removePlayer(sessionId: string) {
    // Remove from world
    const player = this.players[sessionId];
    //@ts-ignore
    Matter.Composite.remove(this.world, [player]);

    console.log("remove player", sessionId);

    // Remove from state
    this.state.removePlayer(sessionId);
  }

  processPlayerAction(sessionId: string, data: any) {
    const world = this.world;
    const worldPlayer = this.players[sessionId];
    if (!worldPlayer) {
      return;
    }

    const currentPosition = worldPlayer.position;
    let newX = currentPosition.x;
    let newY = currentPosition.y;

    // Modify position based on data received from clients.
    if (data.left) {
      newX -= 4;
    }
    if (data.right) {
      newX += 4;
    }
    if (data.up) {
      newY -= 10;
    }
    if (data.face === "left") {
      worldPlayer.face = "left";
    }
    if (data.face === "right") {
      worldPlayer.face = "right";
    }
    if (data.shoot) {
    }

    // Update in the world
    Matter.Body.setPosition(worldPlayer, { x: newX, y: newY });

    // Update in the state
    this.state.players.get(sessionId).x = newX;
    this.state.players.get(sessionId).y = newY;

    function shoot() {
      let offset = 0;
      if (worldPlayer.face === "right") offset = 35;
      if (worldPlayer.face === "left") offset = -35;
      const bullet = Matter.Bodies.rectangle(
        worldPlayer.position.x + offset,
        worldPlayer.position.y,
        12,
        12,
        {
          frictionAir: 0,
        }
      );
      Matter.World.add(world, bullet);
    }
  }
}
