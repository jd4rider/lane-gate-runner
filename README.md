# Lane Gate Runner

Playable starter project for a lane-based crowd runner built with Vite, React, TypeScript, and Phaser 3.

The app is fully static. There is no backend, login, multiplayer, analytics, or external database. All visuals are original placeholders generated from rectangles, circles, and text.

## Features

- 3-lane auto-runner with keyboard and mobile touch controls
- React app shell for title, pause, settings, HUD, win, and game over UI
- Phaser scenes for movement, collisions, spawning, rendering, and level flow
- 3 handcrafted sample levels with increasing difficulty
- Simple endless mode toggle with procedural waves
- Score, progress, unit count, and persistent best score via `localStorage`
- GitHub Pages-friendly Vite base path support

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the Vite dev server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal.

Controls:

- Desktop: Left / Right arrows or `A` / `D`
- Pause: `Esc`
- Mobile: swipe left/right or use the large touch zones

## Build

Create a production build:

```bash
npm run build
```

Vite outputs a static `dist/` folder suitable for GitHub Pages or any other static host.

## GitHub Pages Deployment

The Vite base path is configured in [vite.config.ts](./vite.config.ts) through the `VITE_BASE_PATH` environment variable.

Set it like this:

- User or org site at `https://username.github.io/`: `VITE_BASE_PATH=/`
- Project site at `https://username.github.io/repo-name/`: `VITE_BASE_PATH=/repo-name/`

### Option 1: `.env.production`

Create a `.env.production` file in the project root:

```bash
VITE_BASE_PATH=/repo-name/
```

Then build normally:

```bash
npm run build
```

### Option 2: inline env var

```bash
VITE_BASE_PATH=/repo-name/ npm run build
```

### Publish to GitHub Pages

1. Push the repo to GitHub.
2. Build with the correct `VITE_BASE_PATH`.
3. Publish the built `dist/` folder through your preferred GitHub Pages flow.

Common options:

- GitHub Actions Pages workflow that uploads `dist/`
- A dedicated Pages branch containing the built files
- A `/docs` folder if you prefer branch-based Pages publishing

Because the output is fully static, any Pages setup that serves `dist/` will work.

## Project Structure

```text
lane-gate-runner/
├── README.md
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── components/
    │   ├── GameOverModal.tsx
    │   ├── GameOverlay.tsx
    │   ├── PauseMenu.tsx
    │   ├── SettingsPanel.tsx
    │   ├── StartScreen.tsx
    │   └── WinModal.tsx
    ├── game/
    │   ├── BootScene.ts
    │   ├── GameScene.ts
    │   ├── config.ts
    │   ├── createGame.ts
    │   └── levels.ts
    └── styles/
        └── index.css
```
