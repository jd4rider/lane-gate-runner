import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, type BootSceneData } from './config'

export class BootScene extends Phaser.Scene {
  static readonly KEY = 'BootScene'

  private launchData?: BootSceneData

  constructor() {
    super(BootScene.KEY)
  }

  init(data: BootSceneData) {
    this.launchData = data
  }

  create() {
    this.generateTextures()
    this.scene.start('GameScene', this.launchData)
  }

  private generateTextures() {
    if (!this.textures.exists('track')) {
      const graphics = this.make.graphics()

      graphics.fillStyle(0x08101d, 1)
      graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
      graphics.fillStyle(0x142338, 1)
      graphics.fillRoundedRect(28, 0, GAME_WIDTH - 56, GAME_HEIGHT, 28)
      graphics.fillStyle(0x1b3352, 1)
      graphics.fillRect(44, 0, 88, GAME_HEIGHT)
      graphics.fillRect(166, 0, 88, GAME_HEIGHT)
      graphics.fillRect(288, 0, 88, GAME_HEIGHT)

      graphics.lineStyle(5, 0x35547e, 0.9)
      for (const dividerX of [148, 270]) {
        for (let y = 0; y < GAME_HEIGHT; y += 54) {
          graphics.lineBetween(dividerX, y, dividerX, y + 28)
        }
      }

      graphics.lineStyle(4, 0x22344c, 1)
      graphics.strokeRoundedRect(28, 0, GAME_WIDTH - 56, GAME_HEIGHT, 28)
      graphics.generateTexture('track', GAME_WIDTH, GAME_HEIGHT)
      graphics.clear()
    }

    if (!this.textures.exists('crowd-dot')) {
      const graphics = this.make.graphics()

      graphics.fillStyle(0xfef3c7, 1)
      graphics.fillCircle(10, 10, 8)
      graphics.lineStyle(2, 0xf59e0b, 0.8)
      graphics.strokeCircle(10, 10, 8)
      graphics.generateTexture('crowd-dot', 20, 20)
      graphics.clear()
    }

    if (!this.textures.exists('hazard-dot')) {
      const graphics = this.make.graphics()

      graphics.fillStyle(0xf87171, 1)
      graphics.fillCircle(10, 10, 8)
      graphics.lineStyle(2, 0x7f1d1d, 0.95)
      graphics.strokeCircle(10, 10, 8)
      graphics.generateTexture('hazard-dot', 20, 20)
      graphics.clear()
    }
  }
}
