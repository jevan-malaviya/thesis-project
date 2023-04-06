import * as Colyseus from "colyseus.js";
import HelloWorldScene from "./HelloWorldScene";

export default class RetroLevel extends HelloWorldScene {
    private client!: Colyseus.Client;
    private player?: PlayerSprite;
    private currentPlayer: any;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private playerEntities: { [sessionId: string]: any } = {};
    private room?: Colyseus.Room;
    private backgroundMusic!: Phaser.Sound.BaseSound;
  
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
        super('RetroLevel')
    }

    init() {
        this.client = new Colyseus.Client("ws://localhost:2567");
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    preload() {

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

        this.load.image('retro-tiles', '../assets/tiles/Retro-Lines-Tiles.png');
        this.load.tilemapTiledJSON('retro-map', '../assets/tiles/Retro-Map-v2.json');

    }

    async create() {

        const matter = this.matter;
        this.room = await this.client.joinOrCreate("my_room");

        this.backgroundMusic = this.sound.add('backgroundMusic', {
            volume: 0.5,
            loop: true,
        });
        this.backgroundMusic.play();

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
    
    const retroMap = this.make.tilemap({ key: 'retro-map' });
    const retroTileset = retroMap.addTilesetImage('Retro', 'retro-tiles');

    const landscapeLayer = retroMap.createLayer('Plants', retroTileset );
    const colliders = retroMap.createLayer('Floors', retroTileset)

    colliders.setCollisionByProperty({Collides: true});

    const scaleX = this.scale.width / retroMap.widthInPixels;
    const scaleY = this.scale.height / retroMap.heightInPixels;
    const scale = Math.min(scaleX, scaleY);

    landscapeLayer.setScale(scale);
    colliders.setScale(scale);
    
    }
}