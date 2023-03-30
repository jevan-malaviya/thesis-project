import Phaser from "phaser";
import { WeaponPlugin } from "phaser3-weapon-plugin";

import HelloWorldScene from "./scenes/HelloWorldScene";
import FarmLevel from "./scenes/FarmLevel";
import RetroLevel from "./scenes/RetroLevel";
import MountainLevel from "./scenes/MountainLevel";
import StarterMenu from "./scenes/StarterMenu";
import Controls from "./scenes/Controls";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: 800,
  height: 600,
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 1 },
    },
  },
  scene: [FarmLevel],
  plugins: {
    scene: [
      { key: 'WeaponPlugin', plugin: WeaponPlugin, mapping: 'weapons' } 
    ]
  }
};

export default new Phaser.Game(config);
