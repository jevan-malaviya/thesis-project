import Phaser from "phaser";

export default class RetroLevel extends Phaser.Scene {

    constructor() {
        super('RetroLevel')
    }

    preload() {

        this.load.image('retro-tiles', '../assets/tiles/Retro-Lines-Tiles.png');
        this.load.tilemapTiledJSON('retro-map', '../assets/tiles/Retro-Map-v2.json');

    }

    create() {
    
    const retroMap = this.make.tilemap({ key: 'retro-map' });
    const retroTileset = retroMap.addTilesetImage('Retro', 'retro-tiles');

    retroMap.createLayer('Floors', retroTileset );
    const colliders = retroMap.createLayer('Fence', retroTileset);

    colliders.setCollisionByProperty({Collides: true})
    
    }
}