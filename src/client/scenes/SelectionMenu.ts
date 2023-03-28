import Phaser from "phaser";

export default class SelectionScene extends Phaser.Scene {

    constructor(){
        super('selection-menu');
    }

    
  create() {

    this.add.rectangle(
      this.game.config.width / 2,
      this.game.config.height / 2,
      this.game.config.width,
      this.game.config.height,
      0x000000
    ).setAlpha(0.8);


    this.add.text(
      this.game.config.width / 2,
      100,
      "Select Your Weapon",
      { fontSize: "40px", color: "#ffffff" }
    ).setOrigin(0.5);


    const weaponOptions = [
      { name: "Sword", damage: 20 },
      { name: "Axe", damage: 25 },
      { name: "Bow", damage: 15 },
    ];

    const xStart = 100;
    const yStart = 200;
    const yStep = 100;
    let currentX = xStart;
    let currentY = yStart;

    weaponOptions.forEach((weapon) => {
      const button = this.add.text(
        currentX,
        currentY,
        `${weapon.name} (Damage: ${weapon.damage})`,
        { fontSize: "24px", color: "#ffffff" }
      ).setInteractive();

      button.on("pointerdown", () => {
        // Set the player's weapon to the selected option and go back to the game scene
        this.game.player.weapon = weapon;
        this.scene.resume("hello-world");
        this.scene.stop();
      });

      currentY += yStep;
    });
  }
}