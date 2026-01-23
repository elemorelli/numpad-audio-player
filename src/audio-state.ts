import { getTrackedPlaylists } from './playlists';

let audioInitialized = false;
let globalVolume = 0.7;

const FADE_MS = 2000;

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

export const initializeTrackedPlaylists = async () => {
  if (audioInitialized) return;
  audioInitialized = true;

  await waitForAudioUnlock();

  const playlists = getTrackedPlaylists();

  for (const pl of playlists) {
    if (!pl) continue;

    await pl.update({ fade: FADE_MS });

    const updates = pl.sounds.map((s) => ({
      _id: s.id,
      volume: globalVolume,
    }));

    if (updates.length) {
      await pl.updateEmbeddedDocuments('PlaylistSound', updates);
    }
  }
};
