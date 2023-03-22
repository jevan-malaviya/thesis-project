import Phaser from "phaser";
import * as Colyseus from "colyseus.js";

export default class HelloWorldScene extends Phaser.Scene {
  private client!: Colyseus.Client;
  private player?: Phaser.GameObjects.Sprite &
    Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerEntities: { [sessionId: string]: any } = {};
  private room?: Colyseus.Room;

  inputPayload = {
    left: false,
    right: false,
    up: false,
  };

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
    this.room = await this.client.joinOrCreate("my_room");

    console.log(this.room.sessionId);

    this.add.image(400, 300, "sky");

    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, "ground").setScale(2).refreshBody();
    platforms.create(600, 400, "ground");
    platforms.create(50, 250, "ground");
    platforms.create(750, 220, "ground");

    this.room.state.players.onAdd((player: any, sessionId: string) => {
      const entity = this.physics.add.sprite(player.x, player.y, "dude");
      this.physics.add.existing(entity);
      entity.setBounce(0.2);
      entity.setCollideWorldBounds(true);
      this.physics.add.collider(entity, platforms);
      this.playerEntities[sessionId] = entity;

      player.onChange(() => {
        entity.x = player.x;
        entity.y = player.y;
      });
    });

    this.room.state.players.onRemove((player: any, sessionId: string) => {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();
        delete this.playerEntities[sessionId];
      }
    });

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
  }

  update() {
    if (!this.room) return;

    this.inputPayload.left = this.cursors.left.isDown;
    this.inputPayload.right = this.cursors.right.isDown;
    if (this.cursors.up.isDown && this.player?.body.touching.down) {
      this.inputPayload.up = this.cursors.up.isDown;
    }
    this.room.send(0, this.inputPayload);

    if (this.cursors.left.isDown) {
      this.player?.setVelocityX(-160);
      this.player?.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player?.setVelocityX(160);
      this.player?.anims.play("right", true);
    } else {
      this.player?.setVelocityX(0);
      this.player?.anims.play("turn");
    }
    if (this.cursors.up.isDown && this.player?.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}
