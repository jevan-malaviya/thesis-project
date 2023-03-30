import Phaser, { GameObjects } from "phaser";

export default class StarterMenu extends Phaser.Scene {

    constructor() {
        super('starter-menu');
    }

    preload() {
        this.load.spritesheet('dog1-idle', '../assets/dog1/Idle.png', {
            frameWidth: 64,
            frameHeight: 64,
          });
    }

    create() {


        const title: GameObjects.Text = this.add.text(400, 200, 'Pummel Pups', { fontSize: '48px', fontFamily: 'Monaco', color: '#E05234' });
        title.setOrigin(0.5);

        const startButton = this.add.text(200, 300, 'Start Game', { fontSize: '32px', color: '#FFFFFF'});
        startButton.setOrigin(0.5);
        startButton.setInteractive();

        startButton.on('pointerdown', ()=> {
            this.scene.start('hello-world');
        });

        const controlsButton = this.add.text(600, 300, 'Controls', { fontSize: '32px', color: '#FFFFFF'});
        controlsButton.setOrigin(0.5);
        controlsButton.setInteractive();

        controlsButton.on('pointerdown', ()=> {
            this.scene.start('controls');
        });

        const levelSelectButton = this.add.text(400, 400, 'Level Select', { fontSize: '32px', color: '#FFFFFF'});
        levelSelectButton.setOrigin(0.5);
        levelSelectButton.setInteractive();

        levelSelectButton.on('pointerdown', ()=> {
            this.scene.start('level-select');
        });
    };
}
