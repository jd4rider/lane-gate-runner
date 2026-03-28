import type { RunResult } from '../game/config'

type WinModalProps = {
  result: RunResult
  canAdvance: boolean
  onNextLevel: () => void
  onRestart: () => void
  onBackToTitle: () => void
}

export function WinModal({
  result,
  canAdvance,
  onNextLevel,
  onRestart,
  onBackToTitle,
}: WinModalProps) {
  return (
    <section className="modal-shell">
      <div className="modal-card">
        <p className="panel-eyebrow">Victory</p>
        <h2>Finish line crossed</h2>
        <p className="modal-copy">
          You brought {result.unitCount} units across {result.levelName}. Lock in
          a better score or move straight to the next course.
        </p>

        <div className="result-grid">
          <article>
            <span>Score</span>
            <strong>{result.score}</strong>
          </article>
          <article>
            <span>Units left</span>
            <strong>{result.unitCount}</strong>
          </article>
          <article>
            <span>Best</span>
            <strong>{result.bestScore}</strong>
          </article>
        </div>

        <div className="modal-actions">
          {canAdvance && (
            <button type="button" className="primary-button" onClick={onNextLevel}>
              Next level
            </button>
          )}
          <button type="button" className="secondary-button" onClick={onRestart}>
            Replay
          </button>
          <button type="button" className="secondary-button" onClick={onBackToTitle}>
            Back to title
          </button>
        </div>
      </div>
    </section>
  )
}
