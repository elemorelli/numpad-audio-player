import {
  getPlaylistByKey,
  getTrackedPlaylists,
  PlaylistKey,
} from './playlists';

const VOLUME_STEP = 0.05;
const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

export const togglePlaylist = async (key: PlaylistKey) => {
  const playlist = getPlaylistByKey(key);
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

  ui.notifications?.info(`🎵 ${playlist.name}`);
};

export const stopTrackedPlaylists = async () => {
  const playlists = getTrackedPlaylists();

  for (const playlist of playlists) {
    if (!playlist) continue;
    await playlist.stopAll();
  }
};

const clamp = (v: number) => Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, v));

export const changeVolume = async (delta: number) => {
  const playlists = getTrackedPlaylists();

  for (const pl of playlists) {
    if (!pl) continue;

    const updates = pl.sounds
      .filter((s) => s.playing)
      .map((s) => ({
        _id: s.id,
        volume: clamp((s.volume ?? 1) + delta),
      }));

    if (updates.length > 0) {
      await pl.updateEmbeddedDocuments('PlaylistSound', updates);
    }
  }
};

export const increaseVolume = () => changeVolume(+VOLUME_STEP);
export const decreaseVolume = () => changeVolume(-VOLUME_STEP);
