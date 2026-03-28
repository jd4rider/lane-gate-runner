import { useEffect, useRef, useState, type TouchEvent } from 'react'
import type { GameSettings, HudState } from '../game/config'

type GameOverlayProps = {
  hud: HudState
  paused: boolean
  settings: GameSettings
  onPauseToggle: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
}

type TouchPoint = {
  x: number
  y: number
}

export function GameOverlay({
  hud,
  paused,
  settings,
  onPauseToggle,
  onMoveLeft,
  onMoveRight,
}: GameOverlayProps) {
  const [touchCapable, setTouchCapable] = useState(false)
  const touchStartRef = useRef<TouchPoint | null>(null)

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: coarse)')
    const updateTouchState = () => {
      setTouchCapable(pointerQuery.matches || navigator.maxTouchPoints > 0)
    }

    updateTouchState()
    pointerQuery.addEventListener('change', updateTouchState)
    return () => pointerQuery.removeEventListener('change', updateTouchState)
  }, [])

  const showTouchControls = settings.showTouchZones && touchCapable
  const progressLabel =
    hud.mode === 'endless'
      ? `Wave ${hud.endlessWave}`
      : `${Math.round(hud.progress * 100)}%`

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0]

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    const touch = event.changedTouches[0]

    if (!start) {
      return
    }

    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y

    if (Math.abs(deltaX) > 28 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        onMoveLeft()
      } else {
        onMoveRight()
      }

      touchStartRef.current = null
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const localX = touch.clientX - bounds.left

    if (localX < bounds.width * 0.4) {
      onMoveLeft()
    } else if (localX > bounds.width * 0.6) {
      onMoveRight()
    }

    touchStartRef.current = null
  }

  return (
    <div className="hud-root">
      <div className="hud-top">
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

        <div className="hud-card">
          <span>Best</span>
          <strong>{hud.bestScore}</strong>
        </div>

        <button type="button" className="pause-button" onClick={onPauseToggle}>
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="hud-footer">
        <span>Distance {hud.distance}m</span>
        <span>Controls: arrows, A / D, swipe</span>
      </div>

      {showTouchControls && (
        <>
          <div
            className="gesture-layer"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          <div className="touch-controls">
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
