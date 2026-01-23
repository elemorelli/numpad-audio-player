import { ModuleSettings } from './settings';

const VOLUME_STEP = 0.05;
const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

const getPlaylistForKey = (numpad: number) => {
  const key = ModuleSettings.getPlaylistKey(numpad);

  if (!key) return;
  return ModuleSettings.getPlaylist(key);
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
  const currentSound = playlist.sounds.find((s) => s.playing);
  ui.notifications?.info(`🎵 ${playlist.name}: ${currentSound?.name}`);
};

export const stopTrackedPlaylists = async () => {
  const tracked = getTrackedPlaylists().filter((pl) =>
    pl.sounds.some((s) => s.playing)
  );

  if (!tracked.length) return;

  for (const playlist of tracked) {
    await playlist.stopAll();
  }

  const names = tracked.map((pl) => pl.name).join(', ');
  ui.notifications?.info(`🎵 Stopped playlists: ${names}`);
};

export const nextTrack = async () => {
  const playlists = getTrackedPlaylists().filter(Boolean);

  for (const playlist of playlists) {
    const isPlaying = playlist.sounds.some((s) => s.playing);
    if (!isPlaying) continue;

    await playlist.playNext();

    const currentSound = playlist.sounds.find((s) => s.playing);
    if (currentSound) {
      ui.notifications?.info(`🎵 ${playlist.name}: ${currentSound.name}`);
    }
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
