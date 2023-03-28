import Phaser from "phaser";
import * as Colyseus from "colyseus.js";
// import WeaponPlugin from 'phaser3-weapon-plugin';

export default class HelloWorldScene extends Phaser.Scene {
  private client!: Colyseus.Client;
  private player?: Phaser.GameObjects.Sprite &
    Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerEntities: { [sessionId: string]: any } = {};
  private room?: Colyseus.Room;

  private weapon!: any;


  inputPayload = {
    left: false,
    right: false,
    up: false,
  };

  constructor() {
    super("hello-world");
  }

  //Fix
  // createWeapon(player: Phaser.GameObjects.Sprite & Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
  //   const weapon = this.physics.add.group({
  //     classType: Phaser.GameObjects.Image,
  //     key: 'bullet',
  //     active: false,
  //     visible: false,
  //     maxSize: 10,
  //     defaultKey: 'bullet',
  //   });

  //   weapon.children.iterate((bullet: Phaser.GameObjects.Image) => {
  //     bullet.setScale(0.5); // Adjust the scale of bullet
  //   });

  //   player.weapon = weapon;

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

    //Loading maps & tilesets for maps
    this.load.image("retro-tiles", "../assets/tiles/Retro-Lines-Tiles.png");
    this.load.tilemapTiledJSON(
      "retro-map",
      "../assets/tiles/Retro-Map-v2.json"
    );

    this.load.image("farm-tiles", "../assets/tiles/Farm.png");
    this.load.tilemapTiledJSON("farm-map", "../assets/tiles/Farm.json");

    this.load.image("mountain-tiles", "../assets/tiles/MountainRange.png");
    this.load.tilemapTiledJSON(
      "mountain-map",
      "assets/tiles/MountainRange.json"
    );
  }

  //Fix
    fireBullet(player: Phaser.GameObjects.Sprite & Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    const bullet = player.weapon.get(player.x, player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      this.physics.moveTo(bullet, this.input.x + this.cameras.main.scrollX, this.input.y + this.cameras.main.scrollY, 600); // 600 is the bullet speed
      this.physics.add.collider(bullet, platforms, () => {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.setPosition(-100, -100);
      });
    }
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

    this.room.state.players.onAdd = (player: any, sessionId: string) => {
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

    this.room.state.players.onRemove = (player: any, sessionId: string) => {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();
        delete this.playerEntities[sessionId];
      }
    };

    //Weapons in progress

    // this.plugins.addScenePlugin('weaponplugin', WeaponPlugin, true);
    // this.weapon = this.add.weapon(10, 'bullet'); //this has to be replaced with an image of a bullet once working

    // this.weapon.bulletSpeed = 600;
    // this.weapon.fireRate = 100;

    // this.weapon.trackSprite(this.player, 0, 0, true);

    // this.input.on('pointerdown', () => {
    //   this.weapon.fire();
    // })

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


    this.scene.start('FarmLevel');
  }


  update() {
    if (!this.room) return;

    this.inputPayload.left = this.cursors.left.isDown;
    this.inputPayload.right = this.cursors.right.isDown;
    if (this.cursors.up.isDown && this.player?.body.touching.down) {
      this.inputPayload.up = this.cursors.up.isDown;
    }
    this.room.send(0, this.inputPayload);

    if (this.player) {
      this.player.weaponKey = this.registry.get("selectedWeapon");
    }

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

    //Fix
    if (this.player) {
      this.player.weapon.children.iterate((bullet: Phaser.GameObjects.Image) => {
        if (bullet.active) {
          if (bullet.x < 0 || bullet.x > this.physics.world.bounds.width || bullet.y < 0 || bullet.y > this.physics.world.bounds.height) {
            bullet.setActive(false);
            bullet.setVisible(false);
            bullet.setPosition(-100, -100);
          }
        }
      });
    }
  }
}
