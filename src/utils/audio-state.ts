import { ModuleSettings, Setting } from '../settings';
import { getTrackedPlaylists } from './playlists';

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

  for (const playlist of playlists) {
    if (!playlist) continue;

    const fade = ModuleSettings.get<number>(
      Setting.TRACKED_PLAYLIST_FADE_DURATION
    );

    await playlist.update({ fade });

    const volume = ModuleSettings.get<number>(
      Setting.TRACKED_PLAYLIST_INITIAL_VOLUME
    );

    const updates = playlist.sounds.map((sound) => ({
      _id: sound.id,
      volume: volume,
    }));

    if (updates.length) {
      await playlist.updateEmbeddedDocuments('PlaylistSound', updates);
    }
  }
};
