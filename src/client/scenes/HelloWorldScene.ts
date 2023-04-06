import Phaser from "phaser";
import * as Colyseus from "colyseus.js";
// import WeaponPlugin from 'phaser3-weapon-plugin';
type PlayerSprite = Phaser.GameObjects.Sprite &
  Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
    body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody["body"];
    weapon: Phaser.Physics.Arcade.Group;
    health: number;
  };

export default class HelloWorldScene extends Phaser.Scene {
  private client!: Colyseus.Client;
  private player?: PlayerSprite;
  private currentPlayer: any;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerEntities: { [sessionId: string]: any } = {};
  private room?: Colyseus.Room;
  private backgroundMusic!: Phaser.Sound.BaseSound;
  private platforms?: Phaser.Tilemaps.TilemapLayer;

  private bullets!: Phaser.Physics.Arcade.Group;
  private fireKey!: Phaser.Input.Keyboard.Key;
  private spacebar!: Phaser.Input.Keyboard.Key;

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

  constructor(sceneKey: string = "hello-world") {
    super(sceneKey);
  }

  init() {
    this.client = new Colyseus.Client("ws://localhost:2567");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.spacebar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
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

    this.load.audio('backgroundMusic', '../assets/track1.mp3');

    this.load.image("button", "../assets/next-level.png");

    //Dog 1
    this.load.spritesheet("dog1-idle", "../assets/dog1/Idle.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("dog1-walk", "../assets/dog1/Walk.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("dog1-walk-left", "../assets/dog1/Walk-Left.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("dog1-attack", "../assets/dog1/Attack.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("dog1-hurt", "../assets/dog1/Hurt.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("dog1-ko", "../assets/dog1/Death.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    //Dog 2
    this.load.spritesheet("dog2-idle", "../assets/dog2/Idle.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("dog2-walk", "../assets/dog2/Walk.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("dog2-walk-left", "../assets/dog2/Walk-Left.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("dog2-attack", "../assets/dog2/Attack.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("dog2-hurt", "../assets/dog2/Hurt.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("dog2-ko", "../assets/dog2/Death.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    //Loading maps & tilesets for maps
    this.load.image("retro-tiles", "../assets/tiles/Retro-Lines-Tiles.png");
    this.load.tilemapTiledJSON(
      "retro-map",
      "../assets/tiles/Retro-Map-v2.json"
    );

    this.load.image("farm-tiles", "../assets/tiles/Farm.png");
    this.load.tilemapTiledJSON("farm-map", "../assets/tiles/FarmLevel.json");

    this.load.image("cliff-tiles", "../assets/tiles/Cliffs.png");
    this.load.tilemapTiledJSON("cliff-map", "assets/tiles/Cliffs.json");

    this.load.image("bullet", "../assets/bullet.png");
    
  }

  // initLevel(mapKey: string, tilesetKey: string) {
  //   const map = this.make.tilemap({ key: mapKey});
  //   const tileSet = map.addTilesetImage(tilesetKey);
  //   const platforms = map.createLayer('Platforms', tileSet, 0,0);

  //   platforms.setCollisionByProperty({ Collides: true });0.




  //   this.matter.world.add([
  //     this.matter.bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
  //   ]);

  //   if(this.player){
  //     this.player.setPosition()
  //   this.physics.add.collider(this.player, platforms);
  //   }
  // }

  //Fix
  // fireBullet(player: PlayerSprite) {
  //   const bullet = player.weapon.get(player.x, player.y);
  //   if (bullet) {
  //     bullet.setActive(true);
  //     bullet.setVisible(true);
  //     this.physics.moveTo(
  //       bullet,
  //       this.input.x + this.cameras.main.scrollX,
  //       this.input.y + this.cameras.main.scrollY,
  //       600
  //     ); // 600 is the bullet speed
  //     // this.physics.add.collider(bullet, this.platforms, () => {
  //     //   bullet.setActive(false);
  //     //   bullet.setVisible(false);
  //     //   bullet.setPosition(-100, -100);
  //     // });
  //   } 
  // }

  createPlatformLayer(map: Phaser.Tilemaps.Tilemap, layerName: string, tilesetKey: string): Phaser.Tilemaps.TilemapLayer {
    const tileset = map.addTilesetImage(tilesetKey);
    const layer = map.createLayer(layerName, tileset, 0, 0);
    layer.setCollisionByProperty({ collides: true });
    this.matter.world.convertTilemapLayer(layer);
    return layer;
  }

  // changeLevel(mapKey: string, tilesetKey: string){
  //   this.matter.world.remove(this.platforms);
  //   this.platforms.destroy();

  //   this.initLevel(mapKey, tilesetKey);

  // }

  async create() {
    const matter = this.matter;
    this.room = await this.client.joinOrCreate("my_room");

    this.backgroundMusic = this.sound.add('backgroundMusic', {
      volume: 0.5,
      loop: true,
    });
    this.backgroundMusic.play();

    console.log(this.room.sessionId);

    this.add.image(400, 300, "sky");

    // const map = this.make.tilemap({ key: 'farm-map'});
    // const tileSet = map.addTilesetImage('farm-tiles');
    // map.createStaticLayer('farm-map', tileSet);


    // this.initLevel('farm-map', 'farm-tiles');

    //Dog-1 Movements
    this.anims.create({
      key: "dog1-idle",
      frames: this.anims.generateFrameNumbers("dog1-idle", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dog1-walk",
      frames: this.anims.generateFrameNumbers("dog1-walk", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dog1-walk-left",
      frames: this.anims.generateFrameNumbers("dog1-walk-left", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dog1-attack",
      frames: this.anims.generateFrameNumbers("dog1-attack", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dog1-hurt",
      frames: this.anims.generateFrameNumbers("dog1-hurt", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
    });

    this.anims.create({
      key: "dog1-ko",
      frames: this.anims.generateFrameNumbers("dog1-ko", { start: 0, end: 3 }),
      frameRate: 10,
    });

    //Dog-2 Movements
    this.anims.create({
      key: "dog2-idle",
      frames: this.anims.generateFrameNumbers("dog2-idle", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dog2-walk",
      frames: this.anims.generateFrameNumbers("dog2-walk", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dog2-attack",
      frames: this.anims.generateFrameNumbers("dog2-attack", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dog2-hurt",
      frames: this.anims.generateFrameNumbers("dog2-hurt", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
    });

    this.anims.create({
      key: "dog2-ko",
      frames: this.anims.generateFrameNumbers("dog2-ko", { start: 0, end: 3 }),
      frameRate: 10,
    });

    matter.world.add([
      matter.bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    ]);

    this.room.state.players.onAdd = (player: any, sessionId: string) => {
      const entity = matter.add.sprite(100, 100, "dog1-idle", 0, {
        isStatic: false,
      });

      this.playerEntities[sessionId] = entity;
      console.log(this.playerEntities);

      if (sessionId === this.room?.sessionId) {
        this.currentPlayer = entity;

        this.localRef = this.add.rectangle(0, 0, entity.width, entity.height);
        this.localRef.setStrokeStyle(1, 0x00ff00); // green

        this.remoteRef = this.add.rectangle(0, 0, entity.width, entity.height);
        this.remoteRef.setStrokeStyle(1, 0xff0000); // red

        player.onChange = () => {
          this.remoteRef!.x = player.x;
          this.remoteRef!.y = player.y;
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

    //Weapons in progress

    // this.bullets = this.physics.add.group({
    //   defaultKey: "bullet",
    //   maxSize: 10,
    //   collideWorldBounds: false,
    // });

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

    const button = this.add.image(730, 50, "button").setInteractive();
    button.setScale(0.1)
    button.on("pointerdown", () => {
      this.scene.start("level-select");
      this.backgroundMusic.stop();
    });
  }

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

    // if (this.fireKey.isDown) {
    //   this.fireBullet(this.player as PlayerSprite);
    // }
  }

  fixedTick(time: number, delta: number) {
    this.currentTick++;

    const velocity = 4;
    this.inputPayload.left = this.cursors.left.isDown;
    this.inputPayload.right = this.cursors.right.isDown;
    this.inputPayload.up = this.cursors.up.isDown;
    this.inputPayload.down = this.cursors.down.isDown;

    this.inputPayload.tick = this.currentTick;

    if (this.inputPayload.left && !this.inputPayload.right) {
      this.currentPlayer.x -= velocity;
      this.currentPlayer.anims.play("dog1-walk-left", true);
    } else if (this.inputPayload.right && !this.inputPayload.left) {
      this.currentPlayer.x += velocity;
      this.currentPlayer.anims.play("dog1-walk", true);
    } else {
      this.currentPlayer.anims.play("dog1-idle", true);
    }
    this.room?.send(0, this.inputPayload);

    // if (this.spacebar.isDown) {
    //   this.fireBullet(this.currentPlayer);
    // }

    if (this.inputPayload.up) {
      this.currentPlayer.y -= 10;
    }

    if (this.inputPayload.down){
      this.currentPlayer.anims.play('dog1-attack', true)
    }

    this.localRef!.x = this.currentPlayer.x;
    this.localRef!.y = this.currentPlayer.y;

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

    //Fix
    if (this.player) {
      this.player.weapon.children.iterate(
        //@ts-ignore
        (bullet: Phaser.Physics.Arcade.Image) => {
          if (bullet.active) {
            if (
              bullet.x < 0 ||
              bullet.x > this.physics.world.bounds.width ||
              bullet.y < 0 ||
              bullet.y > this.physics.world.bounds.height
            ) {
              bullet.setActive(false);
              bullet.setVisible(false);
              bullet.setPosition(-100, -100);
            }
          }
        }
      );
    }
  }
}
