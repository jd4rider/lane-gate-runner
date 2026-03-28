import type {
  GateOperation,
  GateSpec,
  HazardSpec,
  LaneIndex,
  LevelDefinition,
  LevelElement,
} from './config'

type EndlessSegment = {
  elements: LevelElement[]
  segmentEnd: number
  wave: number
}

export type EndlessFactory = {
  generateSegment: (startDistance: number) => EndlessSegment
}

const gate = (
  distance: number,
  lane: LaneIndex,
  operation: GateOperation,
  value: number,
): GateSpec => ({
  type: 'gate',
  lane,
  distance,
  operation,
  value,
})

const hazard = (
  distance: number,
  lane: LaneIndex,
  loss: number,
): HazardSpec => ({
  type: 'hazard',
  lane,
  distance,
  loss,
})

export const LEVELS: LevelDefinition[] = [
  {
    id: 'warmup-boulevard',
    name: 'Warm-Up Boulevard',
    description: 'Wide lanes, gentle hazards, and easy positive choices.',
    targetDistance: 2500,
    runSpeed: 242,
    elements: [
      gate(180, 0, '+', 5),
      gate(180, 1, '+', 8),
      gate(180, 2, '+', 3),
      hazard(420, 0, 3),
      gate(420, 1, 'x', 2),
      gate(420, 2, '/', 2),
      gate(670, 0, '+', 12),
      gate(670, 1, '-', 3),
      hazard(670, 2, 4),
      gate(920, 0, '/', 2),
      gate(920, 1, '+', 10),
      gate(920, 2, '+', 6),
      hazard(1180, 0, 5),
      gate(1180, 1, '+', 5),
      gate(1180, 2, 'x', 2),
      gate(1440, 0, '+', 14),
      hazard(1440, 1, 6),
      gate(1440, 2, '-', 4),
      gate(1700, 0, '+', 8),
      gate(1700, 1, '/', 2),
      gate(1700, 2, '+', 16),
      hazard(1960, 0, 7),
      gate(1960, 1, '+', 12),
      gate(1960, 2, 'x', 2),
      gate(2220, 0, '-', 6),
      gate(2220, 1, '+', 18),
      hazard(2220, 2, 8),
    ],
  },
  {
    id: 'rush-hour-loop',
    name: 'Rush Hour Loop',
    description: 'More forced decisions with bigger rewards and bigger hits.',
    targetDistance: 3320,
    runSpeed: 250,
    elements: [
      gate(190, 0, '+', 4),
      gate(190, 1, '+', 9),
      gate(190, 2, '+', 6),
      gate(450, 0, 'x', 2),
      hazard(450, 1, 5),
      gate(450, 2, '+', 12),
      gate(710, 0, '/', 2),
      gate(710, 1, '+', 15),
      gate(710, 2, '-', 4),
      hazard(980, 0, 8),
      gate(980, 1, '+', 8),
      gate(980, 2, 'x', 2),
      gate(1240, 0, '+', 18),
      gate(1240, 1, '-', 6),
      hazard(1240, 2, 10),
      gate(1510, 0, '/', 2),
      gate(1510, 1, '+', 20),
      gate(1510, 2, '+', 10),
      hazard(1780, 0, 9),
      gate(1780, 1, 'x', 2),
      gate(1780, 2, '-', 8),
      gate(2050, 0, '+', 24),
      hazard(2050, 1, 12),
      gate(2050, 2, '+', 14),
      gate(2320, 0, '-', 10),
      gate(2320, 1, '+', 22),
      gate(2320, 2, '/', 2),
      gate(2590, 0, 'x', 2),
      hazard(2590, 1, 14),
      gate(2590, 2, '+', 12),
      gate(2860, 0, '+', 28),
      gate(2860, 1, '-', 12),
      hazard(2860, 2, 15),
      gate(3130, 0, '/', 2),
      gate(3130, 1, '+', 30),
      gate(3130, 2, 'x', 2),
    ],
  },
  {
    id: 'skybridge-chaos',
    name: 'Skybridge Chaos',
    description: 'Tighter timing, harsher penalties, and stronger combo lanes.',
    targetDistance: 3920,
    runSpeed: 258,
    elements: [
      gate(210, 0, '+', 6),
      gate(210, 1, '/', 2),
      gate(210, 2, '+', 12),
      hazard(480, 0, 6),
      gate(480, 1, 'x', 2),
      gate(480, 2, '-', 4),
      gate(760, 0, '+', 18),
      hazard(760, 1, 10),
      gate(760, 2, '/', 2),
      gate(1030, 0, 'x', 2),
      gate(1030, 1, '+', 14),
      hazard(1030, 2, 12),
      gate(1310, 0, '-', 8),
      gate(1310, 1, '+', 22),
      gate(1310, 2, '/', 2),
      hazard(1590, 0, 14),
      gate(1590, 1, 'x', 2),
      gate(1590, 2, '+', 16),
      gate(1870, 0, '+', 26),
      gate(1870, 1, '-', 10),
      hazard(1870, 2, 16),
      gate(2150, 0, '/', 2),
      gate(2150, 1, '+', 24),
      gate(2150, 2, 'x', 2),
      hazard(2430, 0, 18),
      gate(2430, 1, '+', 30),
      gate(2430, 2, '-', 12),
      gate(2710, 0, 'x', 2),
      hazard(2710, 1, 20),
      gate(2710, 2, '+', 18),
      gate(2990, 0, '/', 2),
      gate(2990, 1, '+', 32),
      hazard(2990, 2, 22),
      gate(3270, 0, '-', 14),
      gate(3270, 1, 'x', 2),
      gate(3270, 2, '+', 24),
      hazard(3550, 0, 24),
      gate(3550, 1, '+', 36),
      gate(3550, 2, '/', 2),
      gate(3810, 0, 'x', 2),
      gate(3810, 1, '-', 18),
      gate(3810, 2, '+', 40),
    ],
  },
]

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export function createEndlessFactory(seed: number): EndlessFactory {
  const random = createSeededRandom(seed || 1)
  let wave = 0

  const pickLane = (): LaneIndex => Math.floor(random() * 3) as LaneIndex

  return {
    generateSegment(startDistance: number): EndlessSegment {
      wave += 1

      const difficulty = Math.min(6, 1 + Math.floor((wave - 1) / 2))
      const segmentLength = 440
      const rowOffsets = [110, 240, 360]
      const elements: LevelElement[] = []

      for (const offset of rowOffsets) {
        const distance = startDistance + offset + Math.floor(random() * 18)
        const goodLane = pickLane()
        const bonusLane =
          random() > 0.62
            ? (((goodLane + 1 + Math.floor(random() * 2)) % 3) as LaneIndex)
            : null

        for (let lane = 0 as LaneIndex; lane < 3; lane = (lane + 1) as LaneIndex) {
          if (lane === goodLane || lane === bonusLane) {
            const positiveChoice = random()

            if (positiveChoice > 0.74 + difficulty * 0.01) {
              elements.push(gate(distance, lane, 'x', 2))
              continue
            }

            const addValue = 4 + difficulty * 2 + Math.floor(random() * 6)
            elements.push(gate(distance, lane, '+', addValue))
            continue
          }

          const negativeChoice = random()

          if (negativeChoice > 0.55) {
            elements.push(hazard(distance, lane, 2 + difficulty + Math.floor(random() * 3)))
            continue
          }

          if (negativeChoice > 0.25) {
            elements.push(gate(distance, lane, '-', 2 + difficulty + Math.floor(random() * 4)))
            continue
          }

          elements.push(gate(distance, lane, '/', 2))
        }
      }

      return {
        elements,
        segmentEnd: startDistance + segmentLength,
        wave,
      }
    },
  }
}
