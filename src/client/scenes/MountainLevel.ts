import Phaser from "phaser";

export default class MountainLevel extends Phaser.Scene {

    constructor() {
        super('MountainLevel')
    }

    preload() {

    }

    create() {
    
    const mountainMap = this.make.tilemap({ key: 'mountain-map' });
    const mountainTileset = mountainMap.addTilesetImage('Mountain', 'mountain-tiles');

    mountainMap.createLayer('Landscape',mountainTileset );
    const colliders = mountainMap.createLayer('Fence', mountainTileset);

    colliders.setCollisionByProperty({Collides: true})
    
    }
}