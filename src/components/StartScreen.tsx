import { SettingsPanel } from './SettingsPanel'
import type { GameSettings, LevelDefinition } from '../game/config'

type StartScreenProps = {
  levels: LevelDefinition[]
  selectedLevelIndex: number
  endlessMode: boolean
  bestScore: number
  settings: GameSettings
  onSelectLevel: (index: number) => void
  onToggleEndless: (value: boolean) => void
  onChangeSettings: (settings: GameSettings) => void
  onStart: () => void
}

const difficultyLabels = ['Starter', 'Busy', 'Wild']

export function StartScreen({
  levels,
  selectedLevelIndex,
  endlessMode,
  bestScore,
  settings,
  onSelectLevel,
  onToggleEndless,
  onChangeSettings,
  onStart,
}: StartScreenProps) {
  return (
    <section className="start-screen">
      <div className="hero-card">
        <p className="hero-eyebrow">React + Phaser starter</p>
        <h1>Lane Gate Runner</h1>
        <p className="hero-copy">
          Sweep a growing crowd through three lanes, collect smart gates, avoid
          hazards, and reach the finish line before your unit count collapses.
        </p>

        <div className="hero-stats">
          <article>
            <span>Best score</span>
            <strong>{bestScore}</strong>
          </article>
          <article>
            <span>Levels</span>
            <strong>{levels.length}</strong>
          </article>
          <article>
            <span>Endless mode</span>
            <strong>Included</strong>
          </article>
        </div>

        <button type="button" className="primary-button" onClick={onStart}>
          {endlessMode
            ? 'Start Endless Avenue'
            : `Start ${levels[selectedLevelIndex].name}`}
        </button>
      </div>

      <div className="start-grid">
        <section className="info-panel">
          <div className="panel-header">
            <p className="panel-eyebrow">Campaign</p>
            <h2>Choose a route</h2>
          </div>

          <label className="mode-toggle">
            <input
              type="checkbox"
              checked={endlessMode}
              onChange={(event) => onToggleEndless(event.target.checked)}
            />
            <span>
              <strong>Endless mode</strong>
              <small>
                Procedural waves with no finish line. Best for quick score
                chasing after the base levels feel solid.
              </small>
            </span>
          </label>

          <div className="level-list">
            {levels.map((level, index) => {
              const selected = selectedLevelIndex === index

              return (
                <button
                  key={level.id}
                  type="button"
                  className={`level-card${selected ? ' is-selected' : ''}`}
                  onClick={() => onSelectLevel(index)}
                >
                  <span className="level-badge">
                    {difficultyLabels[index] ?? `Level ${index + 1}`}
                  </span>
                  <strong>{level.name}</strong>
                  <small>{level.description}</small>
                </button>
              )
            })}
          </div>
        </section>

        <section className="info-panel">
          <div className="panel-header">
            <p className="panel-eyebrow">Controls</p>
            <h2>Play anywhere</h2>
          </div>

          <div className="control-list">
            <article>
              <strong>Desktop</strong>
              <p>Use Left / Right arrows or A / D to hop lanes.</p>
            </article>
            <article>
              <strong>Mobile</strong>
              <p>Swipe left or right, or press the large touch zones.</p>
            </article>
            <article>
              <strong>Goal</strong>
              <p>Pick smart gates, dodge hazards, and keep the crowd alive.</p>
            </article>
          </div>

          <SettingsPanel
            settings={settings}
            onChangeSettings={onChangeSettings}
          />
        </section>
      </div>
    </section>
  )
}
