import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { GameOverModal } from './components/GameOverModal'
import { GameOverlay } from './components/GameOverlay'
import { PauseMenu } from './components/PauseMenu'
import { StartScreen } from './components/StartScreen'
import { WinModal } from './components/WinModal'
import {
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  type GameSession,
  type GameSettings,
  type HudState,
  type RunResult,
} from './game/config'
import { createGame, type GameController } from './game/createGame'
import { LEVELS } from './game/levels'

type ScreenState = 'title' | 'playing' | 'paused' | 'gameOver' | 'win'

function loadBestScore(): number {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.bestScore)
    return stored ? Number.parseInt(stored, 10) || 0 : 0
  } catch {
    return 0
  }
}

function persistBestScore(score: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.bestScore, String(score))
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
}

function createInitialHud(bestScore: number): HudState {
  return {
    levelName: LEVELS[0].name,
    levelIndex: 0,
    mode: 'level',
    unitCount: 1,
    score: 0,
    bestScore,
    progress: 0,
    distance: 0,
    endlessWave: 1,
  }
}

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<GameController | null>(null)
  const [screen, setScreen] = useState<ScreenState>('title')
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0)
  const [endlessMode, setEndlessMode] = useState(false)
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS)
  const [bestScore, setBestScore] = useState<number>(() => loadBestScore())
  const [session, setSession] = useState<GameSession | null>(null)
  const [hud, setHud] = useState<HudState>(() => createInitialHud(loadBestScore()))
  const [result, setResult] = useState<RunResult | null>(null)

  const syncHud = useEffectEvent((nextHud: HudState) => {
    setHud(nextHud)
  })

  const finishRun = useEffectEvent(
    (runResult: RunResult, nextScreen: Extract<ScreenState, 'gameOver' | 'win'>) => {
      const resolvedBest = Math.max(bestScore, runResult.score)

      if (resolvedBest !== bestScore) {
        persistBestScore(resolvedBest)
        setBestScore(resolvedBest)
      }

      const finalizedResult: RunResult = {
        ...runResult,
        bestScore: resolvedBest,
      }

      setResult(finalizedResult)
      setHud((currentHud) => ({
        ...currentHud,
        bestScore: resolvedBest,
      }))
      setScreen(nextScreen)
    },
  )

  const startRun = (mode: GameSession['mode'], levelIndex: number) => {
    const nextSession: GameSession = {
      mode,
      levelIndex,
      settings: { ...settings },
      seed: Date.now(),
      bestScore,
    }

    setHud({
      ...createInitialHud(bestScore),
      mode,
      levelName: mode === 'level' ? LEVELS[levelIndex].name : 'Endless Avenue',
      levelIndex,
      bestScore,
    })
    setResult(null)
    setSession(nextSession)
    setScreen('playing')
  }

  const startSelectedRun = () => {
    startRun(endlessMode ? 'endless' : 'level', selectedLevelIndex)
  }

  const restartRun = () => {
    if (!session) {
      return
    }

    startRun(session.mode, session.levelIndex)
  }

  const returnToTitle = () => {
    setSession(null)
    setResult(null)
    setScreen('title')
  }

  const goToNextLevel = () => {
    if (!result || result.mode !== 'level') {
      return
    }

    const nextLevelIndex = Math.min(result.levelIndex + 1, LEVELS.length - 1)
    setSelectedLevelIndex(nextLevelIndex)
    startRun('level', nextLevelIndex)
  }

  useEffect(() => {
    if (!session || !mountRef.current) {
      return undefined
    }

    const controller = createGame({
      mountElement: mountRef.current,
      session,
      callbacks: {
        onHudUpdate: syncHud,
        onGameOver: (runResult) => finishRun(runResult, 'gameOver'),
        onWin: (runResult) => finishRun(runResult, 'win'),
      },
    })

    controllerRef.current = controller

    return () => {
      controller.destroy()

      if (controllerRef.current === controller) {
        controllerRef.current = null
      }
    }
  }, [session])

  useEffect(() => {
    controllerRef.current?.applySettings(settings)
  }, [settings])

  useEffect(() => {
    const controller = controllerRef.current

    if (!controller) {
      return
    }

    if (screen === 'paused') {
      controller.pause()
      return
    }

    if (screen === 'playing') {
      controller.resume()
    }
  }, [screen])

  useEffect(() => {
    if (!session || (screen !== 'playing' && screen !== 'paused')) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      setScreen((current) => {
        if (current === 'playing') {
          return 'paused'
        }

        if (current === 'paused') {
          return 'playing'
        }

        return current
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [session, screen])

  return (
    <div className="app-shell">
      <main className="app-layout">
        {screen === 'title' ? (
          <StartScreen
            levels={LEVELS}
            selectedLevelIndex={selectedLevelIndex}
            endlessMode={endlessMode}
            bestScore={bestScore}
            settings={settings}
            onSelectLevel={setSelectedLevelIndex}
            onToggleEndless={setEndlessMode}
            onChangeSettings={setSettings}
            onStart={startSelectedRun}
          />
        ) : (
          <section className="play-view">
            <div className="game-stage">
              <div ref={mountRef} className="phaser-mount" />
              <GameOverlay
                hud={hud}
                paused={screen === 'paused'}
                settings={settings}
                onPauseToggle={() =>
                  setScreen((current) =>
                    current === 'paused' ? 'playing' : 'paused',
                  )
                }
                onMoveLeft={() => controllerRef.current?.moveLeft()}
                onMoveRight={() => controllerRef.current?.moveRight()}
              />

              {screen === 'paused' && (
                <PauseMenu
                  settings={settings}
                  onChangeSettings={setSettings}
                  onResume={() => setScreen('playing')}
                  onRestart={restartRun}
                  onQuit={returnToTitle}
                />
              )}

              {screen === 'gameOver' && result && (
                <GameOverModal
                  result={result}
                  onRestart={restartRun}
                  onBackToTitle={returnToTitle}
                />
              )}

              {screen === 'win' && result && (
                <WinModal
                  result={result}
                  canAdvance={
                    result.mode === 'level' && result.levelIndex < LEVELS.length - 1
                  }
                  onNextLevel={goToNextLevel}
                  onRestart={restartRun}
                  onBackToTitle={returnToTitle}
                />
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
