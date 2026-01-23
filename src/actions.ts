import { APP_NAME } from './main';

const VOLUME_STEP = 0.05;
const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

const getPlaylistForKey = (key: number) => {
  if (!game.settings) return;

  // @ts-ignore
  const playlistId = game.settings.get(APP_NAME, `key_${key}_playlist`);

  if (!playlistId || !game.playlists) return null;

  return game.playlists.get(playlistId as string) ?? null;
};

export const getTrackedPlaylists = () => {
  if (!game.playlists) return [];
  const tracked: (foundry.documents.Playlist | null)[] = [];
  for (let key = 1; key <= 9; key++) {
    const pl = getPlaylistForKey(key);
    if (pl) tracked.push(pl);
  }
  return tracked.filter(Boolean) as foundry.documents.Playlist[];
};

export const togglePlaylist = async (key: number) => {
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
  ui.notifications?.info(`🎵 ${playlist.name}`);
};

export const stopTrackedPlaylists = async () => {
  const tracked = getTrackedPlaylists();
  for (const playlist of tracked) {
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
