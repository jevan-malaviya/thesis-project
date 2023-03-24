import Phaser from "phaser";

export default class FarmLevel extends Phaser.Scene {

    constructor() {
        super('FarmLevel')
    }

    preload() {

    }

    create() {
    
    const farmMap = this.make.tilemap({ key: 'farm-map' });
    const farmTileset = farmMap.addTilesetImage('Farm', 'farm-tiles');

    farmMap.createLayer('Landscape',farmTileset );
    const colliders = farmMap.createLayer('Fence', farmTileset);

    colliders.setCollisionByProperty({Collides: true})

    this.input.on('pointerdown', (/*pointer*/) => {
        this.scene.start('Retrolevel');
    }, this);
    
    }
}