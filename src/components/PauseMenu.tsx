import { SettingsPanel } from './SettingsPanel'
import type { GameSettings } from '../game/config'

type PauseMenuProps = {
  settings: GameSettings
  onChangeSettings: (settings: GameSettings) => void
  onResume: () => void
  onRestart: () => void
  onQuit: () => void
}

export function PauseMenu({
  settings,
  onChangeSettings,
  onResume,
  onRestart,
  onQuit,
}: PauseMenuProps) {
  return (
    <section className="modal-shell">
      <div className="modal-card">
        <p className="panel-eyebrow">Paused</p>
        <h2>Catch your breath</h2>
        <p className="modal-copy">
          Resume the current run, restart the course, or tweak a couple of quick
          comfort settings.
        </p>

        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={onResume}>
            Resume
          </button>
          <button type="button" className="secondary-button" onClick={onRestart}>
            Restart
          </button>
          <button type="button" className="secondary-button" onClick={onQuit}>
            Back to title
          </button>
        </div>

        <SettingsPanel
          settings={settings}
          onChangeSettings={onChangeSettings}
        />
      </div>
    </section>
  )
}
