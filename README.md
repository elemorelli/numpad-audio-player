# Numpad Audio Player

A [Foundry VTT](https://foundryvtt.com/) module that lets you control playlists with your keyboard's numpad, so you can trigger music and ambience during a session without touching the Playlists sidebar.

## Features

- **Toggle playlists**: assign up to 9 playlists to `Numpad1`–`Numpad9`. Pressing a key starts that playlist (stopping any other tracked playlist first) or stops it if it's already playing.
- **Stop all**: `Numpad0` stops every tracked playlist that's currently playing.
- **Next track**: `NumpadEnter` skips to the next track on whichever tracked playlist is playing.
- **Volume control**: `Numpad+` / `Numpad-` nudge the volume of playing tracks up/down.
- **Mute toggle**: `Numpad.` mutes all tracked playlists and restores their previous volumes when pressed again.
- **Adaptive Audio intensity**: if the [Adaptive Audio](https://foundryvtt.com/packages/adaptive-audio) module is active and playing, `Numpad*` / `Numpad/` raise/lower its intensity.
- Bindings are registered through Foundry's Keybindings API, so every key can be rebound from **Configure Controls** if the numpad defaults don't work for you.

## Setup

1. Install and enable the module.
2. Open **Game Settings → Configure Settings → Numpad Audio Player**.
3. Assign a playlist to each `Numpad Playlist 1`–`9` slot you want to use.
4. Optionally configure:
   - **Minimum Role needed**: lowest user role allowed to use the numpad controls (default: Assistant Gamemaster).
   - **Apply Defaults on Start**: re-apply the initial volume/fade to tracked playlists when the game loads.
   - **Initial Volume for Tracked Playlists** and **Fade Duration for Tracked Playlists**: used when tracked playlists start/stop.

## Requirements

- Foundry VTT v14.
- A physical or virtual numpad (bindings can be remapped in **Configure Controls** if needed).

## Development

```bash
npm install
npm run dev     # watch + typecheck
npm run build   # production build to dist/main.js
npm run format  # prettier
```

Source lives in `src/`; the bundle is built with esbuild to `dist/main.js`, which is the file Foundry loads (see `module.json`).
