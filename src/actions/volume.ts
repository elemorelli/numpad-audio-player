import { getTrackedPlaylists } from '../utils/playlists';

const VOLUME_STEP = 0.05;

export const changeVolume = async (delta: number) => {
  const playlists = getTrackedPlaylists();

  for (const playlist of playlists) {
    if (!playlist) {
      continue;
    }

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

let mutedVolumes: Map<string, number> | null = null;

export const toggleMute = async () => {
  const playlists = getTrackedPlaylists();

  if (mutedVolumes) {
    const savedVolumes = mutedVolumes;
    mutedVolumes = null;

    for (const playlist of playlists) {
      const updates = playlist.sounds
        .filter((sound) => savedVolumes.has(sound.id))
        .map((sound) => ({
          _id: sound.id,
          volume: savedVolumes.get(sound.id)!,
        }));

      if (updates.length > 0) {
        await playlist.updateEmbeddedDocuments('PlaylistSound', updates);
      }
    }

    ui.notifications?.info('🔊 Unmuted');

    return;
  }

  const savedVolumes = new Map<string, number>();

  for (const playlist of playlists) {
    const playingSounds = playlist.sounds.filter((sound) => sound.playing);
    if (!playingSounds.length) {
      continue;
    }

    const updates = playingSounds.map((sound) => {
      savedVolumes.set(sound.id, sound.volume);

      return { _id: sound.id, volume: 0 };
    });

    await playlist.updateEmbeddedDocuments('PlaylistSound', updates);
  }

  if (!savedVolumes.size) {
    return;
  }

  mutedVolumes = savedVolumes;
  ui.notifications?.info('🔇 Muted');
};
