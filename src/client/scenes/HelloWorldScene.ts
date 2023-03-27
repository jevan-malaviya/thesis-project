import Phaser from "phaser";
import * as Colyseus from "colyseus.js";

export default class HelloWorldScene extends Phaser.Scene {
  private client!: Colyseus.Client;
  private currentPlayer: any;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerEntities: { [sessionId: string]: any } = {};
  private room?: Colyseus.Room;

  localRef?: Phaser.GameObjects.Rectangle;
  remoteRef?: Phaser.GameObjects.Rectangle;

  inputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
    tick: 0,
  };

  elapsedTime = 0;
  fixedTimeStep = 1000 / 60;

  currentTick: number = 0;

  constructor() {
    super("hello-world");
  }

  init() {
    this.client = new Colyseus.Client("ws://localhost:2567");
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    this.load.image("sky", "../assets/sky.png");
    this.load.image("ground", "../assets/platform.png");
    this.load.image("star", "../assets/star.png");
    this.load.image("bomb", "../assets/bomb.png");
    this.load.spritesheet("dude", "/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  async create() {
    const matter = this.matter;
    this.room = await this.client.joinOrCreate("my_room");

    console.log(this.room.sessionId);

    this.add.image(400, 300, "sky");

    // const platforms = this.physics.add.staticGroup();
    // platforms.create(400, 568, "ground").setScale(2).refreshBody();
    // platforms.create(600, 400, "ground");
    // platforms.create(50, 250, "ground");
    // platforms.create(750, 220, "ground");

    matter.world.add([
      matter.bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    ]);

    this.room.state.players.onAdd = (player: any, sessionId: string) => {
      const entity = matter.add.sprite(100, 100, "dude", 4, {
        isStatic: false,
      });
      // entity.setBounce(0.2);
      // entity.setCollideWorldBounds(true);
      // this.physics.add.collider(entity, platforms);
      this.playerEntities[sessionId] = entity;
      console.log(this.playerEntities);

      // player.onChange = this.updateChanges(player, entity, true, this.tweens);

      if (sessionId === this.room?.sessionId) {
        this.currentPlayer = entity;

        this.localRef = this.add.rectangle(0, 0, entity.width, entity.height);
        this.localRef.setStrokeStyle(1, 0x00ff00); // green

        this.remoteRef = this.add.rectangle(0, 0, entity.width, entity.height);
        this.remoteRef.setStrokeStyle(1, 0xff0000); // red

        player.onChange = () => {
          this.remoteRef!.x = player.x;
          this.remoteRef!.y = player.y;
          // console.log(this.remoteRef);
        };
      } else {
        // listening for server updates
        player.onChange = () => {
          //
          // we're going to LERP the positions during the render loop.
          //
          entity.setData("serverX", player.x);
          entity.setData("serverY", player.y);
        };
      }
    };

    this.room.state.players.onRemove = (player: any, sessionId: string) => {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();
        delete this.playerEntities[sessionId];
      }
    };

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    // if (this.cursors.left.isDown) {
    //   this.room.send(0, )
    // }
  }

  // updateChanges =
  //   (stateObject: any, worldObject: any, log = false, tweens: any) =>
  //   (changes: any) => {
  //     // Default the position x and y to game object current x and y
  //     let targetX = worldObject.body.position.x;
  //     let targetY = worldObject.body.position.y;

  //     // Apply state changes
  //     //@ts-ignore
  //     changes.forEach(({ field, value }) => {
  //       switch (field) {
  //         case "x":
  //           targetX = value;
  //           break;
  //         case "y":
  //           targetY = value;
  //           break;
  //         default:
  //           break;
  //       }
  //     });

  //     // We smooth the position changes using phaser.io tweens.
  //     // This is very important!!
  //     // Without this, the game will become very laggy with game object jumps from one point to another.
  //     // Tried to use matter physics using velocity sync, but it has very poor performance.
  //     tweens.add({
  //       targets: worldObject,
  //       x: targetX,
  //       y: targetY,
  //       duration: 200,
  //       ease: "Power2",
  //     });
  //   };

  // update(time: number, delta: number): void {
  //   for (let sessionId in this.playerEntities) {
  //     // interpolate all player entities
  //     const entity = this.playerEntities[sessionId];
  //     console.log(entity.data);
  //     const { serverX, serverY } = entity.data.values;

  //     entity.x = Phaser.Math.Linear(entity.x, serverX, 0.2);
  //     entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2);
  //   }

  update(time: number, delta: number): void {
    // skip loop if not connected yet.
    if (!this.currentPlayer) {
      return;
    }

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedTick(time, this.fixedTimeStep);
    }
  }

  fixedTick(time: number, delta: number) {
    this.currentTick++;

    // const currentPlayerRemote = this.room.state.players.get(this.room.sessionId);
    // const ticksBehind = this.currentTick - currentPlayerRemote.tick;
    // console.log({ ticksBehind });

    const velocity = 2;
    this.inputPayload.left = this.cursors.left.isDown;
    this.inputPayload.right = this.cursors.right.isDown;
    this.inputPayload.up = this.cursors.up.isDown;

    this.inputPayload.tick = this.currentTick;
    this.room?.send(0, this.inputPayload);

    if (this.inputPayload.left) {
      this.currentPlayer.x -= velocity;
    } else if (this.inputPayload.right) {
      this.currentPlayer.x += velocity;
    }

    if (this.inputPayload.up) {
      this.currentPlayer.y -= 2;
    }

    this.localRef!.x = this.currentPlayer.x;
    this.localRef!.y = this.currentPlayer.y;

    // this.currentPlayer.x = Phaser.Math.Linear(
    //   this.currentPlayer.x,
    //   this.remoteRef!.x,
    //   0.2
    // );
    // this.currentPlayer.y = Phaser.Math.Linear(
    //   this.currentPlayer.y,
    //   this.remoteRef!.y,
    //   0.2
    // );

    for (let sessionId in this.playerEntities) {
      // interpolate all player entities
      // (except the current player)
      if (sessionId === this.room?.sessionId) {
        continue;
      }

      const entity = this.playerEntities[sessionId];
      const { serverX, serverY } = entity.data.values;

      entity.x = Phaser.Math.Linear(entity.x, serverX, 0.2);
      entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2);
    }
  }
}
