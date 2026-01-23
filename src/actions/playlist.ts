import { getPlaylistForKey, getTrackedPlaylists } from '../utils/playlists';

export const togglePlaylist = async (key: number) => {
  const playlist = getPlaylistForKey(key);
  if (!playlist) return;

  const trackedPlaylists = getTrackedPlaylists();
  const isPlaying = playlist.sounds.some((sound) => sound.playing);

  for (const trackedPlaylist of trackedPlaylists) {
    if (!trackedPlaylist || trackedPlaylist.id === playlist.id) continue;
    await trackedPlaylist.stopAll();
  }

  if (isPlaying) {
    await playlist.stopAll();
    return;
  }

  await playlist.playAll();
  const currentSound = playlist.sounds.find((sound) => sound.playing);
  ui.notifications?.info(`🎵 ${playlist.name}: ${currentSound?.name}`);
};

export const stopTrackedPlaylists = async () => {
  const tracked = getTrackedPlaylists().filter((playlist) =>
    playlist.sounds.some((sound) => sound.playing)
  );

  if (!tracked.length) return;

  for (const playlist of tracked) {
    await playlist.stopAll();
  }

  const names = tracked.map((playlist) => playlist.name).join(', ');
  ui.notifications?.info(`🎵 Stopped playlists: ${names}`);
};

export const nextTrack = async () => {
  const playlists = getTrackedPlaylists().filter(Boolean);

  for (const playlist of playlists) {
    const isPlaying = playlist.sounds.some((sound) => sound.playing);
    if (!isPlaying) continue;

    await playlist.playNext();

    const currentSound = playlist.sounds.find((sound) => sound.playing);
    if (currentSound) {
      ui.notifications?.info(`🎵 ${playlist.name}: ${currentSound.name}`);
    }
  }
};
