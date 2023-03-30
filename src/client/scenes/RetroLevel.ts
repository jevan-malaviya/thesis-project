
import HelloWorldScene from "./HelloWorldScene";

export default class RetroLevel extends HelloWorldScene {

    constructor() {
        super('RetroLevel')
    }

    preload() {

        this.load.image('retro-tiles', '../assets/tiles/Retro-Lines-Tiles.png');
        this.load.tilemapTiledJSON('retro-map', '../assets/tiles/Retro-Map-v2.json');

    }

    async create() {
    
    const retroMap = this.make.tilemap({ key: 'retro-map' });
    const retroTileset = retroMap.addTilesetImage('Retro', 'retro-tiles');

    const landscapeLayer = retroMap.createLayer('Plants', retroTileset );
    const colliders = retroMap.createLayer('Floors', retroTileset);

    colliders.setCollisionByProperty({Collides: true});

    const scaleX = this.scale.width / retroMap.widthInPixels;
    const scaleY = this.scale.height / retroMap.heightInPixels;
    const scale = Math.min(scaleX, scaleY);

    landscapeLayer.setScale(scale);
    colliders.setScale(scale);
    
    }
}