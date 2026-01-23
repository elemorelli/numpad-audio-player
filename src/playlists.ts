export type PlaylistKey = keyof typeof PLAYLISTS;

interface PlaylistRef {
  id: string;
  name: string;
}

const PLAYLISTS: Record<number, PlaylistRef> = {
  1: {
    id: 'd9kXwpU2dZpfcoja',
    name: 'Combat',
  },
  2: {
    id: 'txiQ0bBwIQjH7wJB',
    name: 'Dramatic',
  },
  3: {
    id: 'k3GzXH6rVtP8qiJt',
    name: 'Exploration',
  },
  4: {
    id: 'xmJR0hkfvpuVDSnq',
    name: 'Mystery',
  },
  5: {
    id: 'C8bvWm7w2zzKjs6f',
    name: 'Peaceful',
  },
  6: {
    id: 'BPg371VMhgTbXMGN',
    name: 'Town',
  },
};

export const getPlaylistByKey = (key: PlaylistKey) => {
  if (!game.playlists) return null;
  const ref = PLAYLISTS[key];
  if (!ref) return null;

  return game.playlists.get(ref.id) ?? null;
};

export const getTrackedPlaylists = () => {
  if (!game.playlists) return [];
  return Object.values(PLAYLISTS)
    .map((p) => game.playlists!.get(p.id))
    .filter(Boolean);
};
