import Phaser from 'phaser'
import { BootScene } from './BootScene'
import { GameScene } from './GameScene'
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  type GameCallbacks,
  type GameSession,
  type GameSettings,
} from './config'

type CreateGameOptions = {
  mountElement: HTMLDivElement
  session: GameSession
  callbacks: GameCallbacks
}

export type GameController = {
  pause: () => void
  resume: () => void
  destroy: () => void
  moveLeft: () => void
  moveRight: () => void
  setTouchSteer: (normalizedX: number) => void
  clearTouchSteer: () => void
  applySettings: (settings: GameSettings) => void
}

export function createGame({
  mountElement,
  session,
  callbacks,
}: CreateGameOptions): GameController {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: mountElement,
    backgroundColor: '#08101d',
    render: {
      antialias: true,
      pixelArt: false,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [],
  })

  game.scene.add(BootScene.KEY, new BootScene(), false)
  game.scene.add(GameScene.KEY, new GameScene(), false)
  game.scene.start(BootScene.KEY, { session, callbacks })

  const resolveGameScene = (): GameScene | null => {
    const scene = game.scene.keys[GameScene.KEY]
    return scene ? (scene as GameScene) : null
  }

  return {
    pause() {
      resolveGameScene()?.setPaused(true)
    },
    resume() {
      resolveGameScene()?.setPaused(false)
    },
    moveLeft() {
      resolveGameScene()?.moveLeft()
    },
    moveRight() {
      resolveGameScene()?.moveRight()
    },
    setTouchSteer(normalizedX) {
      resolveGameScene()?.setTouchSteer(normalizedX)
    },
    clearTouchSteer() {
      resolveGameScene()?.clearTouchSteer()
    },
    applySettings(settings) {
      resolveGameScene()?.applySettings(settings)
    },
    destroy() {
      game.destroy(true)
      mountElement.replaceChildren()
    },
  }
}
