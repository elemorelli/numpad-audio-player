// src/settings.ts
var NUMPAD_PLAYLIST_SETTINGS = [
  "key_1_playlist" /* KEY_1_PLAYLIST */,
  "key_2_playlist" /* KEY_2_PLAYLIST */,
  "key_3_playlist" /* KEY_3_PLAYLIST */,
  "key_4_playlist" /* KEY_4_PLAYLIST */,
  "key_5_playlist" /* KEY_5_PLAYLIST */,
  "key_6_playlist" /* KEY_6_PLAYLIST */,
  "key_7_playlist" /* KEY_7_PLAYLIST */,
  "key_8_playlist" /* KEY_8_PLAYLIST */,
  "key_9_playlist" /* KEY_9_PLAYLIST */
];
var ModuleSettings = {
  defaultRegisterOptions: {
    scope: "world",
    requiresReload: true,
    config: true
  },
  register: (key, data) => {
    if (!game.settings) return;
    const options = {
      ...ModuleSettings.defaultRegisterOptions,
      ...data
    };
    game.settings.register(APP_NAME, key, options);
  },
  has: (key) => {
    if (!game.settings) return void 0;
    return game.settings.settings.has(`${APP_NAME}.${key}`);
  },
  get: (key) => {
    if (!game.settings) return void 0;
    return game.settings.get(APP_NAME, key);
  },
  set: (key, value) => {
    if (!game.settings) return;
    return game.settings.set(APP_NAME, key, value);
  },
  getPlaylist: (key) => {
    if (!game.settings || !game.playlists) return null;
    const id = game.settings.get(APP_NAME, key);
    if (!id) return null;
    return game.playlists.get(id) ?? null;
  },
  getPlaylistKey: (numpad) => {
    if (numpad < 1 || numpad > 9) return null;
    return NUMPAD_PLAYLIST_SETTINGS[numpad - 1] ?? null;
  }
};
var initializeDefaultSettings = () => {
  ModuleSettings.register("minimum_role" /* MINIMUM_ROLE */, {
    name: "Minimum Role needed",
    hint: "Players must have at least this role to control playlists.",
    type: Number,
    requiresReload: true,
    default: CONST.USER_ROLES.ASSISTANT,
    choices: {
      [CONST.USER_ROLES.PLAYER]: "Player",
      [CONST.USER_ROLES.TRUSTED]: "Trusted Player",
      [CONST.USER_ROLES.ASSISTANT]: "Assistant Gamemaster",
      [CONST.USER_ROLES.GAMEMASTER]: "Gamemaster"
    }
  });
  ModuleSettings.register("apply_defaults_on_start" /* APPLY_DEFAULTS_ON_START */, {
    name: "Apply Defaults on Start",
    hint: "If enabled, the module will apply default settings (volume, fade) to the playlists assigned to numpad keys when the game starts.",
    type: Boolean,
    default: true
  });
  ModuleSettings.register("tracked_playlist_initial_volume" /* TRACKED_PLAYLIST_INITIAL_VOLUME */, {
    name: "Initial Volume for Tracked Playlists",
    hint: "Sets the initial volume for playlists that are assigned to numpad keys when starting or resuming playback.",
    type: Number,
    default: 0.7,
    range: {
      min: 0,
      max: 1,
      step: 0.01
    }
  });
  ModuleSettings.register("tracked_playlist_fade_duration" /* TRACKED_PLAYLIST_FADE_DURATION */, {
    name: "Fade Duration for Tracked Playlists (ms)",
    hint: "Time in milliseconds used for fade-in/fade-out when starting or stopping playlists assigned to numpad keys.",
    type: Number,
    default: 2e3,
    range: {
      min: 0,
      max: 1e4,
      step: 100
    }
  });
  for (const key of NUMPAD_PLAYLIST_SETTINGS) {
    if (!ModuleSettings.has(key)) {
      ModuleSettings.register(key, {
        name: `Numpad Playlist ${key.split("_")[1]}`,
        type: String,
        requiresReload: false,
        default: "",
        choices: {}
      });
    }
  }
};
var canUseModule = () => {
  if (!game.user) return;
  const minRole = ModuleSettings.get("minimum_role" /* MINIMUM_ROLE */);
  return (game.user.role ?? CONST.USER_ROLES.NONE) >= minRole;
};
var populatePlaylistsChoices = () => {
  const playlists = game.playlists?.contents ?? [];
  const choices = { "": "None" };
  playlists.forEach((pl) => {
    const folderName = pl.folder?.name;
    const label = folderName ? `[${folderName}] ${pl.name}` : pl.name;
    choices[pl.id] = label;
  });
  NUMPAD_PLAYLIST_SETTINGS.forEach((key) => {
    const currentValue = ModuleSettings.get(key) ?? "";
    ModuleSettings.register(key, {
      name: `Numpad Playlist ${key.split("_")[1]}`,
      type: String,
      default: "",
      choices
    });
    ModuleSettings.set(key, currentValue);
  });
};

// src/actions.ts
var VOLUME_STEP = 0.05;
var MIN_VOLUME = 0;
var MAX_VOLUME = 1;
var getPlaylistForKey = (numpad) => {
  const key = ModuleSettings.getPlaylistKey(numpad);
  if (!key) return;
  return ModuleSettings.getPlaylist(key);
};
var getTrackedPlaylists = () => {
  if (!game.playlists) return [];
  const tracked = [];
  for (let key = 1; key <= 9; key++) {
    const pl = getPlaylistForKey(key);
    if (pl) tracked.push(pl);
  }
  return tracked.filter(Boolean);
};
var togglePlaylist = async (key) => {
  const playlist = getPlaylistForKey(key);
  if (!playlist) return;
  const tracked = getTrackedPlaylists();
  const isPlaying = playlist.sounds.some((s) => s.playing);
  for (const p of tracked) {
    if (!p || p.id === playlist.id) continue;
    await p.stopAll();
  }
  if (isPlaying) {
    await playlist.stopAll();
    return;
  }
  await playlist.playAll();
  const currentSound = playlist.sounds.find((s) => s.playing);
  ui.notifications?.info(`\u{1F3B5} ${playlist.name}: ${currentSound?.name}`);
};
var stopTrackedPlaylists = async () => {
  const tracked = getTrackedPlaylists().filter(
    (pl) => pl.sounds.some((s) => s.playing)
  );
  if (!tracked.length) return;
  for (const playlist of tracked) {
    await playlist.stopAll();
  }
  const names = tracked.map((pl) => pl.name).join(", ");
  ui.notifications?.info(`\u{1F3B5} Stopped playlists: ${names}`);
};
var nextTrack = async () => {
  const playlists = getTrackedPlaylists().filter(Boolean);
  for (const playlist of playlists) {
    const isPlaying = playlist.sounds.some((s) => s.playing);
    if (!isPlaying) continue;
    await playlist.playNext();
    const currentSound = playlist.sounds.find((s) => s.playing);
    if (currentSound) {
      ui.notifications?.info(`\u{1F3B5} ${playlist.name}: ${currentSound.name}`);
    }
  }
};
var clamp = (v) => Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, v));
var changeVolume = async (delta) => {
  const playlists = getTrackedPlaylists();
  for (const pl of playlists) {
    if (!pl) continue;
    const updates = pl.sounds.filter((s) => s.playing).map((s) => ({
      _id: s.id,
      volume: clamp((s.volume ?? 1) + delta)
    }));
    if (updates.length > 0) {
      await pl.updateEmbeddedDocuments("PlaylistSound", updates);
    }
  }
};
var increaseVolume = () => changeVolume(+VOLUME_STEP);
var decreaseVolume = () => changeVolume(-VOLUME_STEP);

// src/audio-state.ts
var waitForAudioUnlock = async () => {
  if (!game.audio?.locked) return;
  await new Promise((resolve) => {
    const handler = () => {
      if (!game.audio?.locked) {
        window.removeEventListener("pointerdown", handler);
        window.removeEventListener("keydown", handler);
        resolve();
      }
    };
    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
  });
};
var applyTrackedPlaylistDefaults = async () => {
  const shouldInitializeAudio = ModuleSettings.get("apply_defaults_on_start" /* APPLY_DEFAULTS_ON_START */);
  if (!shouldInitializeAudio) return;
  await waitForAudioUnlock();
  const playlists = getTrackedPlaylists();
  for (const pl of playlists) {
    if (!pl) continue;
    const fade = ModuleSettings.get("tracked_playlist_fade_duration" /* TRACKED_PLAYLIST_FADE_DURATION */);
    await pl.update({ fade });
    const volume = ModuleSettings.get("tracked_playlist_initial_volume" /* TRACKED_PLAYLIST_INITIAL_VOLUME */);
    const updates = pl.sounds.map((s) => ({
      _id: s.id,
      volume
    }));
    if (updates.length) {
      await pl.updateEmbeddedDocuments("PlaylistSound", updates);
    }
  }
};

// src/numpad-capture.ts
var enabled = false;
var NUMPAD_ACTIONS = {
  Numpad0: stopTrackedPlaylists,
  Numpad1: () => togglePlaylist(1),
  Numpad2: () => togglePlaylist(2),
  Numpad3: () => togglePlaylist(3),
  Numpad4: () => togglePlaylist(4),
  Numpad5: () => togglePlaylist(5),
  Numpad6: () => togglePlaylist(6),
  Numpad7: () => togglePlaylist(7),
  Numpad8: () => togglePlaylist(8),
  Numpad9: () => togglePlaylist(9),
  NumpadAdd: increaseVolume,
  NumpadSubtract: decreaseVolume,
  NumpadEnter: nextTrack
};
var handleNumpadEvent = (event) => {
  if (event.code === "NumLock") {
    enabled = !event.getModifierState("NumLock");
    return;
  }
  if (!enabled) return;
  const action = NUMPAD_ACTIONS[event.code];
  if (!action) return;
  action();
};
var enableNumpadCapture = () => {
  if (enabled) return;
  enabled = true;
  window.addEventListener(
    "keydown",
    (event) => {
      if (!event.code.startsWith("Numpad") && event.code !== "NumLock") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      handleNumpadEvent(event);
    },
    true
  );
};

// src/main.ts
var APP_NAME = "numpad-audio-player";
Hooks.once("init", async () => {
  initializeDefaultSettings();
});
Hooks.once("ready", async () => {
  if (!canUseModule()) return;
  await applyTrackedPlaylistDefaults();
  populatePlaylistsChoices();
  enableNumpadCapture();
});
Hooks.on("createPlaylist", populatePlaylistsChoices);
Hooks.on("updatePlaylist", populatePlaylistsChoices);
Hooks.on("deletePlaylist", populatePlaylistsChoices);
export {
  APP_NAME
};
//# sourceMappingURL=main.js.map
