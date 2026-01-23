import { getTrackedPlaylists } from './actions';
import { ModuleSettings, Setting } from './settings';

const waitForAudioUnlock = async () => {
  if (!game.audio?.locked) return;

  await new Promise<void>((resolve) => {
    const handler = () => {
      if (!game.audio?.locked) {
        window.removeEventListener('pointerdown', handler);
        window.removeEventListener('keydown', handler);
        resolve();
      }
    };

    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
  });
};

export const applyTrackedPlaylistDefaults = async () => {
  const shouldApplyDefaults = ModuleSettings.get<boolean>(
    Setting.APPLY_DEFAULTS_ON_START
  );

  if (!shouldApplyDefaults) return;

  await waitForAudioUnlock();

  const playlists = getTrackedPlaylists();

  for (const pl of playlists) {
    if (!pl) continue;

    const fade = ModuleSettings.get<number>(
      Setting.TRACKED_PLAYLIST_FADE_DURATION
    );

    await pl.update({ fade });

    const volume = ModuleSettings.get<number>(
      Setting.TRACKED_PLAYLIST_INITIAL_VOLUME
    );

    const updates = pl.sounds.map((s) => ({
      _id: s.id,
      volume: volume,
    }));

    if (updates.length) {
      await pl.updateEmbeddedDocuments('PlaylistSound', updates);
    }
  }
};
