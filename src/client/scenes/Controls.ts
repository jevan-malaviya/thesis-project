import Phaser, { GameObjects } from "phaser";

export default class Controls extends Phaser.Scene {
    constructor() {
        super('controls');
    }

    preload(){

    }

    create() {
        const title: GameObjects.Text = this.add.text(400, 100, 'Controls', { fontSize: '48px', color: '#E05234' });
        title.setOrigin(0.5);

        const movement: GameObjects.Text = this.add.text(200, 300, 'Movement: Key Pad', { fontSize: '32px', color: '#ffffff' });
        movement.setOrigin(0.5);

        const attack: GameObjects.Text = this.add.text(200, 400, 'Attack: Left Click', { fontSize: '32px', color: '#ffffff' });
        attack.setOrigin(0.5);

        const backButton = this.add.text(500, 500, 'back', { fontSize: '32px', color: '#FFFFFF'});
        backButton.setOrigin(0.5);
        backButton.setInteractive();

        backButton.on('pointerdown', ()=> {
            this.scene.start('starter-menu');
        });
    }
}