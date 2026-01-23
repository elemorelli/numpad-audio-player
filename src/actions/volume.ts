import { getTrackedPlaylists } from './playlist';

const VOLUME_STEP = 0.05;

export const changeVolume = async (delta: number) => {
  const playlists = getTrackedPlaylists();

  for (const pl of playlists) {
    if (!pl) continue;

    const updates = pl.sounds
      .filter((s) => s.playing)
      .map((s) => ({
        _id: s.id,
        volume: Math.clamp(s.volume + delta, 0, 1),
      }));

    if (updates.length > 0) {
      await pl.updateEmbeddedDocuments('PlaylistSound', updates);
    }
  }
};

export const increaseVolume = () => changeVolume(+VOLUME_STEP);

export const decreaseVolume = () => changeVolume(-VOLUME_STEP);
