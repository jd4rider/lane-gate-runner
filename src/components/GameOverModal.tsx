import type { RunResult } from '../game/config'

type GameOverModalProps = {
  result: RunResult
  onRestart: () => void
  onBackToTitle: () => void
}

export function GameOverModal({
  result,
  onRestart,
  onBackToTitle,
}: GameOverModalProps) {
  return (
    <section className="modal-shell">
      <div className="modal-card">
        <p className="panel-eyebrow">Game over</p>
        <h2>The crowd ran out</h2>
        <p className="modal-copy">
          Your unit count hit zero before the run was safe. Pick better gates or
          dodge a few more hazards on the next attempt.
        </p>

        <div className="result-grid">
          <article>
            <span>Score</span>
            <strong>{result.score}</strong>
          </article>
          <article>
            <span>Distance</span>
            <strong>{result.distance}m</strong>
          </article>
          <article>
            <span>Best</span>
            <strong>{result.bestScore}</strong>
          </article>
        </div>

        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={onRestart}>
            Retry
          </button>
          <button type="button" className="secondary-button" onClick={onBackToTitle}>
            Back to title
          </button>
        </div>
      </div>
    </section>
  )
}
