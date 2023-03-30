import HelloWorldScene from "./HelloWorldScene";

export default class FarmLevel extends HelloWorldScene {

    constructor() {
        super('FarmLevel')
    }

    preload() {

    }

    async create() {
    
    const farmMap = this.make.tilemap({ key: 'farm-map' });
    const farmTileset = farmMap.addTilesetImage('Farm', 'farm-tiles');

    farmMap.createLayer('Landscape',farmTileset );
    const colliders = farmMap.createLayer('Fence', farmTileset);  

    colliders.setCollisionByProperty({Collides: true})

    
    }
}