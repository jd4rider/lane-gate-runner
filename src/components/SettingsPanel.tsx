import type { GameSettings } from '../game/config'

type SettingsPanelProps = {
  settings: GameSettings
  onChangeSettings: (settings: GameSettings) => void
}

export function SettingsPanel({
  settings,
  onChangeSettings,
}: SettingsPanelProps) {
  const toggle = (key: keyof GameSettings) => {
    onChangeSettings({
      ...settings,
      [key]: !settings[key],
    })
  }

  return (
    <section className="settings-panel">
      <div className="panel-header">
        <p className="panel-eyebrow">Settings</p>
        <h3>Run preferences</h3>
      </div>

      <label className="setting-row">
        <input
          type="checkbox"
          checked={settings.showTouchZones}
          onChange={() => toggle('showTouchZones')}
        />
        <span>
          <strong>Show touch zones</strong>
          <small>Keep big mobile left/right buttons visible during play.</small>
        </span>
      </label>

      <label className="setting-row">
        <input
          type="checkbox"
          checked={settings.screenShake}
          onChange={() => toggle('screenShake')}
        />
        <span>
          <strong>Camera shake</strong>
          <small>Add a little impact feedback on hazards and hard hits.</small>
        </span>
      </label>
    </section>
  )
}
