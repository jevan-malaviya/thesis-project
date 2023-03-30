import Phaser, { GameObjects } from "phaser";

export default class LevelSelect extends Phaser.Scene {
    constructor() {
        super('level-select')
    };

    preload() {

    }

    create() {
        const title: GameObjects.Text = this.add.text(400, 100, 'Level Select', { fontSize: '48px', color: '#E05234' });
        title.setOrigin(0.5);

        const mainButton = this.add.text(200, 300, 'Main', { fontSize: '32px', color: '#ffffff' });
        mainButton.setOrigin(0.5);
        mainButton.setInteractive();

        mainButton.on('pointerdown', () => {
            this.scene.start('hello-world')
        });

        const farmButton = this.add.text(200, 350, 'Farm', { fontSize: '32px', color: '#ffffff' });
        farmButton.setOrigin(0.5);
        farmButton.setInteractive();

        farmButton.on('pointerdown', () => {
            this.scene.start('FarmLevel')
        })
    }
}