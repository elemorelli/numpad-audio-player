import { getTrackedPlaylists } from '../utils/playlists';

const VOLUME_STEP = 0.05;

export const changeVolume = async (delta: number) => {
  const playlists = getTrackedPlaylists();

  for (const playlist of playlists) {
    if (!playlist) continue;

    const updates = playlist.sounds
      .filter((sound) => sound.playing)
      .map((sound) => ({
        _id: sound.id,
        volume: Math.clamp(sound.volume + delta, 0, 1),
      }));

    if (updates.length > 0) {
      await playlist.updateEmbeddedDocuments('PlaylistSound', updates);
    }
  }
};

export const increaseVolume = () => changeVolume(+VOLUME_STEP);

export const decreaseVolume = () => changeVolume(-VOLUME_STEP);
