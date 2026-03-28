import Phaser from 'phaser'
import {
  CAMERA_FOLLOW_Y,
  DEFAULT_RUN_SPEED,
  DEFAULT_SETTINGS,
  GAME_HEIGHT,
  GAME_WIDTH,
  LANE_CHANGE_DURATION,
  LANE_X,
  MAX_VISIBLE_CROWD,
  PLAYER_BASE_Y,
  type BootSceneData,
  type GameCallbacks,
  type GameSettings,
  type GateOperation,
  type GameSession,
  type HazardSpec,
  type HudState,
  type LaneIndex,
  type LevelDefinition,
  type LevelElement,
  type RunResult,
} from './config'
import { LEVELS, createEndlessFactory, type EndlessFactory } from './levels'

type LetterKeys = {
  A: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
}

type BaseItem = {
  kind: 'gate' | 'hazard'
  distance: number
  lane: LaneIndex
  container: Phaser.GameObjects.Container
  processed: boolean
}

type GateItem = BaseItem & {
  kind: 'gate'
  operation: GateOperation
  value: number
}

type HazardItem = BaseItem & {
  kind: 'hazard'
  value: number
}

type SceneItem = GateItem | HazardItem

const CROWD_POSITIONS = [
  { x: 0, y: -10 },
  { x: -16, y: 8 },
  { x: 16, y: 8 },
  { x: -28, y: 24 },
  { x: 0, y: 24 },
  { x: 28, y: 24 },
  { x: -14, y: 40 },
  { x: 14, y: 40 },
  { x: -34, y: 56 },
  { x: -10, y: 56 },
  { x: 10, y: 56 },
  { x: 34, y: 56 },
  { x: -22, y: 72 },
  { x: 0, y: 72 },
  { x: 22, y: 72 },
  { x: -12, y: 88 },
  { x: 12, y: 88 },
  { x: 0, y: 104 },
] as const

export class GameScene extends Phaser.Scene {
  static readonly KEY = 'GameScene'

  private session!: GameSession
  private callbacks!: GameCallbacks
  private settings: GameSettings = { ...DEFAULT_SETTINGS }
  private activeLevel!: LevelDefinition
  private road!: Phaser.GameObjects.TileSprite
  private player!: Phaser.GameObjects.Container
  private playerCountText!: Phaser.GameObjects.Text
  private playerShadow!: Phaser.GameObjects.Ellipse
  private crowdDots: Phaser.GameObjects.Image[] = []
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private letterKeys?: LetterKeys
  private items: SceneItem[] = []
  private finishLine?: Phaser.GameObjects.Container
  private endlessFactory?: EndlessFactory
  private nextEndlessDistance = 0
  private endlessWave = 1
  private targetLane: LaneIndex = 1
  private laneTween?: Phaser.Tweens.Tween
  private playerDistance = 0
  private unitCount = 1
  private scoreOffset = 0
  private finishDistance = 0
  private hudTick = 0
  private paused = false
  private ended = false

  constructor() {
    super(GameScene.KEY)
  }

  init(data: BootSceneData) {
    this.session = data.session
    this.callbacks = data.callbacks
    this.settings = { ...data.session.settings }
    this.playerDistance = 0
    this.unitCount = 1
    this.scoreOffset = 0
    this.items = []
    this.targetLane = 1
    this.finishDistance = 0
    this.hudTick = 0
    this.paused = false
    this.ended = false
    this.endlessWave = 1
    this.nextEndlessDistance = 0
    this.finishLine = undefined
    this.endlessFactory = undefined
  }

  create() {
    this.activeLevel =
      this.session.mode === 'level'
        ? LEVELS[this.session.levelIndex]
        : {
            id: 'endless-avenue',
            name: 'Endless Avenue',
            description: 'Procedural waves with escalating pressure.',
            targetDistance: 0,
            elements: [],
          }

    const worldHeight =
      this.session.mode === 'level'
        ? PLAYER_BASE_Y + this.activeLevel.targetDistance + 1200
        : 200000

    this.cameras.main.setBounds(0, 0, GAME_WIDTH, worldHeight)
    this.cameras.main.setBackgroundColor(0x08101d)
    this.createRoad()
    this.createPlayer()
    this.registerInputs()

    if (this.session.mode === 'level') {
      this.finishDistance = this.activeLevel.targetDistance

      for (const element of this.activeLevel.elements) {
        this.spawnElement(element)
      }

      this.items.sort((left, right) => left.distance - right.distance)
      this.spawnFinishLine(this.finishDistance)
    } else {
      this.endlessFactory = createEndlessFactory(this.session.seed)

      for (let index = 0; index < 5; index += 1) {
        this.spawnNextEndlessSegment()
      }
    }

    this.emitHud(true)
  }

  update(_time: number, delta: number) {
    if (this.paused || this.ended) {
      return
    }

    this.handleKeyboardInput()
    this.advanceRunner(delta)
    this.resolvePassedItems()
    this.cleanupPastItems()

    if (this.session.mode === 'level' && this.playerDistance >= this.finishDistance) {
      this.endRun('finish')
      return
    }

    if (this.session.mode === 'endless') {
      this.maybeSpawnMoreEndlessContent()
    }

    this.hudTick += delta
    if (this.hudTick >= 90) {
      this.hudTick = 0
      this.emitHud()
    }
  }

  setPaused(paused: boolean) {
    if (this.ended) {
      return
    }

    this.paused = paused

    if (paused) {
      this.tweens.pauseAll()
      return
    }

    this.tweens.resumeAll()
  }

  moveLeft() {
    this.shiftLane(-1)
  }

  moveRight() {
    this.shiftLane(1)
  }

  applySettings(settings: GameSettings) {
    this.settings = { ...settings }
  }

  private createRoad() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x020617)
      .setScrollFactor(0)
      .setDepth(-30)

    this.add.circle(72, 112, 120, 0x0ea5e9, 0.12).setScrollFactor(0).setDepth(-29)
    this.add.circle(350, 210, 140, 0x10b981, 0.1).setScrollFactor(0).setDepth(-29)

    this.road = this.add
      .tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'track')
      .setScrollFactor(0)
      .setDepth(-20)

    this.add
      .rectangle(GAME_WIDTH / 2, 80, GAME_WIDTH, 160, 0x08101d, 0.2)
      .setScrollFactor(0)
      .setDepth(-10)
  }

  private createPlayer() {
    const glow = this.add.circle(0, 24, 58, 0xf59e0b, 0.14)
    this.playerShadow = this.add.ellipse(0, 116, 76, 22, 0x020617, 0.36)
    const core = this.add.circle(0, 36, 26, 0xfcd34d, 0.92)
    const coreStroke = this.add.circle(0, 36, 27, 0x000000, 0).setStrokeStyle(4, 0xfef3c7, 0.85)
    this.playerCountText = this.add
      .text(0, -36, '1', {
        fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
        fontSize: '30px',
        fontStyle: '700',
        color: '#fff7d6',
        stroke: '#7c2d12',
        strokeThickness: 5,
      })
      .setOrigin(0.5)

    this.player = this.add.container(LANE_X[1], PLAYER_BASE_Y, [
      glow,
      this.playerShadow,
      core,
      coreStroke,
      this.playerCountText,
    ])

    for (let index = 0; index < MAX_VISIBLE_CROWD; index += 1) {
      const dot = this.add.image(0, 0, 'crowd-dot').setVisible(false)
      this.crowdDots.push(dot)
      this.player.add(dot)
    }

    this.player.setDepth(20)
    this.refreshCrowdVisual()
  }

  private registerInputs() {
    this.cursors = this.input.keyboard?.createCursorKeys()
    const letterKeys = this.input.keyboard?.addKeys({
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    })

    if (letterKeys) {
      this.letterKeys = letterKeys as LetterKeys
    }
  }

  private handleKeyboardInput() {
    const leftPressed =
      (this.cursors?.left && Phaser.Input.Keyboard.JustDown(this.cursors.left)) ||
      (this.letterKeys?.A && Phaser.Input.Keyboard.JustDown(this.letterKeys.A))

    if (leftPressed) {
      this.moveLeft()
    }

    const rightPressed =
      (this.cursors?.right && Phaser.Input.Keyboard.JustDown(this.cursors.right)) ||
      (this.letterKeys?.D && Phaser.Input.Keyboard.JustDown(this.letterKeys.D))

    if (rightPressed) {
      this.moveRight()
    }
  }

  private advanceRunner(delta: number) {
    const runSpeed =
      this.session.mode === 'endless'
        ? DEFAULT_RUN_SPEED + Math.min(48, this.endlessWave * 4)
        : this.activeLevel.runSpeed ?? DEFAULT_RUN_SPEED

    this.playerDistance += (delta / 1000) * runSpeed
    this.player.y = PLAYER_BASE_Y + this.playerDistance

    const cameraTarget = Math.max(0, this.player.y - CAMERA_FOLLOW_Y)
    this.cameras.main.scrollY = cameraTarget
    this.road.tilePositionY = this.cameras.main.scrollY
  }

  private shiftLane(direction: -1 | 1) {
    if (this.paused || this.ended) {
      return
    }

    const nextLane = Phaser.Math.Clamp(this.targetLane + direction, 0, 2) as LaneIndex

    if (nextLane === this.targetLane) {
      return
    }

    this.targetLane = nextLane
    this.laneTween?.stop()
    this.laneTween = this.tweens.add({
      targets: this.player,
      x: LANE_X[this.targetLane],
      duration: LANE_CHANGE_DURATION,
      ease: 'Sine.Out',
    })
  }

  private spawnElement(element: LevelElement) {
    if (element.type === 'gate') {
      this.spawnGate(element)
      return
    }

    this.spawnHazard(element)
  }

  private spawnGate(element: Extract<LevelElement, { type: 'gate' }>) {
    const fillColor =
      element.operation === '+'
        ? 0x10b981
        : element.operation === 'x'
          ? 0x0ea5e9
          : element.operation === '-'
            ? 0xf97316
            : 0x64748b

    const container = this.add.container(
      LANE_X[element.lane],
      PLAYER_BASE_Y + element.distance,
    )

    const glow = this.add.rectangle(0, 0, 110, 64, fillColor, 0.18)
    const body = this.add.rectangle(0, 0, 94, 54, fillColor, 0.96)
    body.setStrokeStyle(4, 0xf8fafc, 0.82)

    const label = this.add
      .text(0, 0, `${element.operation}${element.value}`, {
        fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
        fontSize: '26px',
        fontStyle: '700',
        color: '#03121d',
      })
      .setOrigin(0.5)

    container.add([glow, body, label])
    container.setDepth(4)

    this.items.push({
      kind: 'gate',
      distance: element.distance,
      lane: element.lane,
      container,
      processed: false,
      operation: element.operation,
      value: element.value,
    })
  }

  private spawnHazard(element: HazardSpec) {
    const container = this.add.container(
      LANE_X[element.lane],
      PLAYER_BASE_Y + element.distance,
    )

    const glow = this.add.rectangle(0, 0, 106, 54, 0xef4444, 0.12)
    const body = this.add.rectangle(0, 0, 92, 44, 0x7f1d1d, 0.96)
    body.setStrokeStyle(4, 0xfca5a5, 0.75)

    const label = this.add
      .text(0, 6, `-${element.loss}`, {
        fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
        fontSize: '24px',
        fontStyle: '700',
        color: '#fee2e2',
      })
      .setOrigin(0.5)

    container.add([glow, body, label])

    for (const xOffset of [-26, 0, 26]) {
      const spike = this.add.image(xOffset, -18, 'hazard-dot').setScale(0.72)
      container.add(spike)
    }

    container.setDepth(4)

    this.items.push({
      kind: 'hazard',
      distance: element.distance,
      lane: element.lane,
      container,
      processed: false,
      value: element.loss,
    })
  }

  private spawnFinishLine(distance: number) {
    const container = this.add.container(GAME_WIDTH / 2, PLAYER_BASE_Y + distance)

    const banner = this.add.rectangle(0, -36, 224, 42, 0xf8fafc, 0.92)
    banner.setStrokeStyle(4, 0x0f172a, 0.9)

    const label = this.add
      .text(0, -36, 'FINISH', {
        fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
        fontSize: '24px',
        fontStyle: '700',
        color: '#0f172a',
      })
      .setOrigin(0.5)

    container.add([banner, label])

    for (let index = 0; index < 10; index += 1) {
      const stripe = this.add.rectangle(
        -180 + index * 40,
        0,
        40,
        30,
        index % 2 === 0 ? 0xf8fafc : 0x0f172a,
        1,
      )
      container.add(stripe)
    }

    const border = this.add.rectangle(0, 0, 400, 30, 0x000000, 0)
    border.setStrokeStyle(4, 0xe2e8f0, 0.9)
    container.add(border)

    this.finishLine = container.setDepth(3)
  }

  private resolvePassedItems() {
    for (const item of this.items) {
      if (item.processed) {
        continue
      }

      if (item.distance > this.playerDistance + 24) {
        break
      }

      item.processed = true
      const laneHit = Math.abs(item.container.x - this.player.x) <= 48

      if (!laneHit) {
        this.consumeVisual(item.container, false)
        continue
      }

      if (item.kind === 'gate') {
        this.applyGate(item)
        continue
      }

      this.applyHazard(item)
    }
  }

  private applyGate(item: GateItem) {
    const previousCount = this.unitCount
    let nextCount = previousCount

    if (item.operation === '+') {
      nextCount += item.value
    } else if (item.operation === '-') {
      nextCount -= item.value
    } else if (item.operation === 'x') {
      nextCount *= item.value
    } else {
      nextCount = Math.floor(nextCount / item.value)
    }

    nextCount = Math.max(0, nextCount)
    const delta = nextCount - previousCount
    this.scoreOffset += delta >= 0 ? delta * 12 : delta * 8
    this.applyCountChange(nextCount, delta >= 0 ? 0xd1fae5 : 0xfed7aa)
    this.showFloatingText(`${item.operation}${item.value}`, delta >= 0 ? '#6ee7b7' : '#fb923c')
    this.consumeVisual(item.container, true)
  }

  private applyHazard(item: HazardItem) {
    const nextCount = Math.max(0, this.unitCount - item.value)
    this.scoreOffset -= item.value * 10
    this.applyCountChange(nextCount, 0xfecaca)
    this.showFloatingText(`-${item.value}`, '#fca5a5')
    this.consumeVisual(item.container, true)

    if (this.settings.screenShake) {
      this.cameras.main.shake(100, 0.004)
    }
  }

  private applyCountChange(nextCount: number, tint: number) {
    this.unitCount = nextCount
    this.playerCountText.setText(String(this.unitCount))
    this.playerCountText.setTint(tint)
    this.refreshCrowdVisual()

    this.tweens.add({
      targets: this.player,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 90,
      yoyo: true,
    })

    this.time.delayedCall(120, () => {
      this.playerCountText.clearTint()
    })

    if (this.unitCount <= 0) {
      this.endRun('game-over')
    }
  }

  private refreshCrowdVisual() {
    const visibleCount = Math.min(MAX_VISIBLE_CROWD, Math.max(this.unitCount, 0))

    for (let index = 0; index < this.crowdDots.length; index += 1) {
      const dot = this.crowdDots[index]

      if (index < visibleCount) {
        const position = CROWD_POSITIONS[index]
        dot.setPosition(position.x, position.y)
        dot.setVisible(true)
      } else {
        dot.setVisible(false)
      }
    }

    this.playerShadow.setVisible(visibleCount > 0)
  }

  private consumeVisual(container: Phaser.GameObjects.Container, triggered: boolean) {
    this.tweens.add({
      targets: container,
      alpha: triggered ? 0.24 : 0.12,
      scaleX: triggered ? 0.9 : 0.82,
      scaleY: triggered ? 0.9 : 0.82,
      duration: 140,
    })
  }

  private showFloatingText(text: string, color: string) {
    const popup = this.add
      .text(this.player.x, this.player.y - 82, text, {
        fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
        fontSize: '26px',
        fontStyle: '700',
        color,
        stroke: '#08101d',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(30)

    this.tweens.add({
      targets: popup,
      y: popup.y - 42,
      alpha: 0,
      duration: 420,
      onComplete: () => popup.destroy(),
    })
  }

  private maybeSpawnMoreEndlessContent() {
    if (this.playerDistance < this.nextEndlessDistance - 900) {
      return
    }

    this.spawnNextEndlessSegment()
  }

  private spawnNextEndlessSegment() {
    const segment = this.endlessFactory?.generateSegment(this.nextEndlessDistance)

    if (!segment) {
      return
    }

    for (const element of segment.elements) {
      this.spawnElement(element)
    }

    this.items.sort((left, right) => left.distance - right.distance)
    this.nextEndlessDistance = segment.segmentEnd
    this.endlessWave = segment.wave
  }

  private cleanupPastItems() {
    while (this.items.length > 0 && this.items[0].distance < this.playerDistance - 320) {
      const staleItem = this.items.shift()
      staleItem?.container.destroy()
    }

    if (
      this.finishLine &&
      this.session.mode === 'level' &&
      this.finishDistance < this.playerDistance - 240
    ) {
      this.finishLine.destroy()
      this.finishLine = undefined
    }
  }

  private computeScore() {
    const distanceScore = Math.floor(this.playerDistance * 0.42)
    const crowdScore = Math.max(0, this.unitCount - 1) * 15
    return Math.max(0, distanceScore + crowdScore + this.scoreOffset)
  }

  private emitHud(force = false) {
    if (!force && this.paused) {
      return
    }

    const score = this.computeScore()
    const progress =
      this.session.mode === 'level'
        ? Phaser.Math.Clamp(this.playerDistance / this.finishDistance, 0, 1)
        : (this.playerDistance % 440) / 440

    const hudState: HudState = {
      levelName: this.activeLevel.name,
      levelIndex: this.session.levelIndex,
      mode: this.session.mode,
      unitCount: this.unitCount,
      score,
      bestScore: Math.max(this.session.bestScore, score),
      progress,
      distance: Math.floor(this.playerDistance),
      endlessWave: this.endlessWave,
    }

    this.callbacks.onHudUpdate(hudState)
  }

  private endRun(reason: RunResult['reason']) {
    if (this.ended) {
      return
    }

    this.ended = true
    this.laneTween?.stop()
    this.emitHud(true)

    if (reason === 'finish' && this.settings.screenShake) {
      this.cameras.main.flash(220, 220, 255, 220)
    }

    const score = this.computeScore()
    const result: RunResult = {
      reason,
      mode: this.session.mode,
      levelIndex: this.session.levelIndex,
      levelName: this.activeLevel.name,
      unitCount: this.unitCount,
      score,
      bestScore: Math.max(this.session.bestScore, score),
      distance: Math.floor(this.playerDistance),
      endlessWave: this.endlessWave,
    }

    if (reason === 'finish') {
      this.callbacks.onWin(result)
      return
    }

    this.callbacks.onGameOver(result)
  }
}
