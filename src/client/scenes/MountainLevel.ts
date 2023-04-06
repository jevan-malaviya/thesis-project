import HelloWorldScene from "./HelloWorldScene";

export default class Cliffs extends HelloWorldScene {

    constructor() {
        super('Cliffs')
    }

    preload() {

    }

    async create() {
    
    const cliffMap = this.make.tilemap({ key: 'mcliff-map' });
    const cliffTileset = cliffnMap.addTilesetImage('Cliffs', 'mocliff-tiles');

    cliffMap.createLayer('Landscape', cliffTileset );
    const colliders = cliffMap.createLayer('Ground', cliffTileset);

    colliders.setCollisionByProperty({Collides: true})
    
    }
}