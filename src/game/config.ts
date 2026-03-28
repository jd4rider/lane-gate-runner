export const GAME_WIDTH = 420
export const GAME_HEIGHT = 760
export const PLAYER_BASE_Y = 560
export const CAMERA_FOLLOW_Y = 560
export const DEFAULT_RUN_SPEED = 248
export const LANE_CHANGE_DURATION = 140
export const MAX_VISIBLE_CROWD = 18
export const LANE_X = [104, 210, 316] as const

export const STORAGE_KEYS = {
  bestScore: 'lane-gate-runner-best-score',
} as const

export type LaneIndex = 0 | 1 | 2
export type GateOperation = '+' | '-' | 'x' | '/'

export type GateSpec = {
  type: 'gate'
  lane: LaneIndex
  distance: number
  operation: GateOperation
  value: number
}

export type HazardSpec = {
  type: 'hazard'
  lane: LaneIndex
  distance: number
  loss: number
}

export type LevelElement = GateSpec | HazardSpec

export type LevelDefinition = {
  id: string
  name: string
  description: string
  targetDistance: number
  runSpeed?: number
  elements: LevelElement[]
}

export type GameMode = 'level' | 'endless'

export type GameSettings = {
  showTouchZones: boolean
  screenShake: boolean
}

export type GameSession = {
  mode: GameMode
  levelIndex: number
  settings: GameSettings
  seed: number
  bestScore: number
}

export type HudState = {
  levelName: string
  levelIndex: number
  mode: GameMode
  unitCount: number
  score: number
  bestScore: number
  progress: number
  distance: number
  endlessWave: number
}

export type RunResult = {
  reason: 'game-over' | 'finish'
  mode: GameMode
  levelIndex: number
  levelName: string
  unitCount: number
  score: number
  bestScore: number
  distance: number
  endlessWave: number
}

export type GameCallbacks = {
  onHudUpdate: (hud: HudState) => void
  onGameOver: (result: RunResult) => void
  onWin: (result: RunResult) => void
}

export type BootSceneData = {
  session: GameSession
  callbacks: GameCallbacks
}

export const DEFAULT_SETTINGS: GameSettings = {
  showTouchZones: true,
  screenShake: true,
}
