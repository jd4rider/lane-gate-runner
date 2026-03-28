import { useEffect, useState, type TouchEvent } from 'react'
import type { GameSettings, HudState } from '../game/config'

type GameOverlayProps = {
  hud: HudState
  paused: boolean
  settings: GameSettings
  onPauseToggle: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onTouchSteer: (normalizedX: number) => void
  onTouchSteerEnd: () => void
}

export function GameOverlay({
  hud,
  paused,
  settings,
  onPauseToggle,
  onMoveLeft,
  onMoveRight,
  onTouchSteer,
  onTouchSteerEnd,
}: GameOverlayProps) {
  const [touchCapable, setTouchCapable] = useState(false)
  const [compactHud, setCompactHud] = useState(false)

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: coarse)')
    const compactQuery = window.matchMedia('(max-width: 560px)')
    const updateTouchState = () => {
      setTouchCapable(pointerQuery.matches || navigator.maxTouchPoints > 0)
      setCompactHud(compactQuery.matches)
    }

    const attach = (query: MediaQueryList) => {
      if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', updateTouchState)
        return () => query.removeEventListener('change', updateTouchState)
      }

      const legacyQuery = query as MediaQueryList & {
        addListener: (listener: (event: MediaQueryListEvent) => void) => void
        removeListener: (listener: (event: MediaQueryListEvent) => void) => void
      }

      legacyQuery.addListener(updateTouchState)
      return () => legacyQuery.removeListener(updateTouchState)
    }

    updateTouchState()
    const detachPointer = attach(pointerQuery)
    const detachCompact = attach(compactQuery)

    return () => {
      detachPointer()
      detachCompact()
    }
  }, [])

  const showTouchControls = settings.showTouchZones && touchCapable
  const progressLabel =
    hud.mode === 'endless'
      ? `Wave ${hud.endlessWave}`
      : `${Math.round(hud.progress * 100)}%`

  const steerFromTouch = (event: TouchEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const touch = event.changedTouches[0] ?? event.touches[0]

    if (!touch || bounds.width <= 0) {
      return
    }

    const localX = touch.clientX - bounds.left
    const normalizedX = Math.max(0, Math.min(1, localX / bounds.width))
    onTouchSteer(normalizedX)
  }

  return (
    <div className={`hud-root${compactHud ? ' hud-root--compact' : ''}`}>
      <div className={`hud-top${compactHud ? ' hud-top--compact' : ''}`}>
        <div className="hud-card hud-card--wide">
          <span>{hud.levelName}</span>
          <strong>{progressLabel}</strong>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.max(0, Math.min(100, hud.progress * 100))}%` }}
            />
          </div>
        </div>

        <div className="hud-card">
          <span>Units</span>
          <strong>{hud.unitCount}</strong>
        </div>

        <div className="hud-card">
          <span>Score</span>
          <strong>{hud.score}</strong>
        </div>

        {!compactHud && (
          <div className="hud-card">
            <span>Best</span>
            <strong>{hud.bestScore}</strong>
          </div>
        )}

        <button
          type="button"
          className={`pause-button${compactHud ? ' pause-button--compact' : ''}`}
          onClick={onPauseToggle}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className={`hud-footer${compactHud ? ' hud-footer--compact' : ''}`}>
        {compactHud ? (
          <>
            <span>Best {hud.bestScore}</span>
            <span>{hud.distance}m</span>
          </>
        ) : (
          <>
            <span>Distance {hud.distance}m</span>
            <span>Controls: arrows, A / D, swipe</span>
          </>
        )}
      </div>

      {showTouchControls && (
        <>
          <div
            className="gesture-layer"
            onTouchStart={steerFromTouch}
            onTouchMove={steerFromTouch}
            onTouchEnd={onTouchSteerEnd}
            onTouchCancel={onTouchSteerEnd}
          />

          <div className={`touch-controls${compactHud ? ' touch-controls--compact' : ''}`}>
            <button type="button" onPointerDown={onMoveLeft}>
              Left
            </button>
            <button type="button" onPointerDown={onMoveRight}>
              Right
            </button>
          </div>
        </>
      )}
    </div>
  )
}
