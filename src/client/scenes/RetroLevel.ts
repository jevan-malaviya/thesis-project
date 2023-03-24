import Phaser from "phaser";

export default class RetroLevel extends Phaser.Scene {

    constructor() {
        super('RetroLevel')
    }

    preload() {

    }

    create() {
    
    const retroMap = this.make.tilemap({ key: 'retro-map' });
    const retroTileset = retroMap.addTilesetImage('Retro', 'retro-tiles');

    retroMap.createLayer('Floors', retroTileset );
    const colliders = retroMap.createLayer('Fence', retroTileset);

    colliders.setCollisionByProperty({Collides: true})
    
    }
}