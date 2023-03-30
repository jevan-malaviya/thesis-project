import HelloWorldScene from "./HelloWorldScene";
import * as Colyseus from "colyseus.js";

export default class FarmLevel extends HelloWorldScene {
    private client!: Colyseus.Client;
    private player?: PlayerSprite;
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
        super('FarmLevel')
    }

    init() {
        this.client = new Colyseus.Client("ws://localhost:2567");
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    preload() {

        this.load.spritesheet("dude", "/assets/dude.png", {
            frameWidth: 32,
            frameHeight: 48,
          });

        this.load.image('farm-tiles', '../assets/tiles/Farm.png');
        this.load.tilemapTiledJSON('farm-map', '../assets/tiles/Farm.json');
    }

    async create() {
        const matter = this.matter;
        this.room = await this.client.joinOrCreate("my_room");

        matter.world.add([
            matter.bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
          ]);
      
          this.room.state.players.onAdd = (player: any, sessionId: string) => {
            const entity = matter.add.sprite(100, 100, "dude", 4, {
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
    
    const farmMap = this.make.tilemap({ key: 'farm-map' });
    const farmTileset = farmMap.addTilesetImage('Farm', 'farm-tiles');

    const landscapeLayer = farmMap.createLayer('Landscape',farmTileset );
    const colliders = farmMap.createLayer('Fence', farmTileset);  

    colliders.setCollisionByProperty({Collides: true});

    const scaleX = this.scale.width / farmMap.widthInPixels;
    const scaleY = this.scale.height / farmMap.heightInPixels;
    const scale = Math.min(scaleX, scaleY);

    landscapeLayer.setScale(scale);
    colliders.setScale(scale);
    
    
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
    
        this.inputPayload.tick = this.currentTick;
    
        if (this.inputPayload.left && !this.inputPayload.right) {
          this.currentPlayer.x -= velocity;
          this.currentPlayer.anims.play("left", true);
        } else if (this.inputPayload.right && !this.inputPayload.left) {
          this.currentPlayer.x += velocity;
          this.currentPlayer.anims.play("right", true);
        } else {
          this.currentPlayer.anims.play("turn");
        }
        this.room?.send(0, this.inputPayload);
    
        // if (this.spacebar.isDown) {
        //   this.fireBullet(this.currentPlayer);
        // }
    
        if (this.inputPayload.up) {
          this.currentPlayer.y -= 10;
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