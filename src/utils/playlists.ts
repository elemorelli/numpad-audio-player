import { ModuleSettings } from '../settings';

export const getPlaylistForKey = (numpad: number) => {
  const key = ModuleSettings.getPlaylistKey(numpad);

  if (!key) return;
  return ModuleSettings.getPlaylist(key);
};

export const getTrackedPlaylists = () => {
  if (!game.playlists) return [];

  const tracked: (foundry.documents.Playlist | null)[] = [];

  for (let key = 1; key <= 9; key++) {
    const playlist = getPlaylistForKey(key);
    if (playlist) tracked.push(playlist);
  }

  return tracked.filter(Boolean) as foundry.documents.Playlist[];
};
