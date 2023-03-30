import HelloWorldScene from "./HelloWorldScene";

export default class FarmLevel extends HelloWorldScene {
    

    constructor() {
        super('FarmLevel')
    }

    preload() {

        this.load.image('farm-tiles', '../assets/tiles/Farm.png');
        this.load.tilemapTiledJSON('farm-map', '../assets/tiles/Farm.json');
    }

    async create() {
    
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
}