import Phaser from "phaser";

export function createWeapon(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite & Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
  const weapon = scene.physics.add.group({
    classType: Phaser.GameObjects.Image,
    key: 'bullet',
    active: false,
    visible: false,
    maxSize: 10,
    defaultKey: 'bullet',
  });

  weapon.children.iterate((bullet: Phaser.GameObjects.Image) => {
    bullet.setScale(0.5); // Adjust the scale of bullet
  });
  player.weapon = weapon;
}

export function fireBullet(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite & Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, platforms: Phaser.Physics.Arcade.StaticGroup) {
  const bullet = player.weapon.get(player.x, player.y);
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    scene.physics.moveTo(bullet, scene.input.x + scene.cameras.main.scrollX, scene.input.y + scene.cameras.main.scrollY, 600); // 600 is the bullet speed
    scene.physics.add.collider(bullet, platforms, () => {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.setPosition(-100, -100);
    });
  }
}