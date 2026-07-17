import {
  decreaseIntensity,
  decreaseVolume,
  increaseIntensity,
  increaseVolume,
  nextTrack,
  stopTrackedPlaylists,
  toggleMute,
  togglePlaylist,
} from './actions';
import { APP_NAME } from './main';
import { canUseModule } from './settings';

type NumpadAction = () => void | Promise<void>;

interface NumpadBinding {
  key: string;
  name: string;
  onDown: NumpadAction;
  repeat?: boolean;
}

const NUMPAD_BINDINGS: Record<string, NumpadBinding> = {
  'stop-tracked-playlists': {
    key: 'Numpad0',
    name: 'Stop Tracked Playlists',
    onDown: stopTrackedPlaylists,
  },

  'toggle-playlist-1': {
    key: 'Numpad1',
    name: 'Toggle Playlist 1',
    onDown: () => togglePlaylist(1),
  },
  'toggle-playlist-2': {
    key: 'Numpad2',
    name: 'Toggle Playlist 2',
    onDown: () => togglePlaylist(2),
  },
  'toggle-playlist-3': {
    key: 'Numpad3',
    name: 'Toggle Playlist 3',
    onDown: () => togglePlaylist(3),
  },
  'toggle-playlist-4': {
    key: 'Numpad4',
    name: 'Toggle Playlist 4',
    onDown: () => togglePlaylist(4),
  },
  'toggle-playlist-5': {
    key: 'Numpad5',
    name: 'Toggle Playlist 5',
    onDown: () => togglePlaylist(5),
  },
  'toggle-playlist-6': {
    key: 'Numpad6',
    name: 'Toggle Playlist 6',
    onDown: () => togglePlaylist(6),
  },
  'toggle-playlist-7': {
    key: 'Numpad7',
    name: 'Toggle Playlist 7',
    onDown: () => togglePlaylist(7),
  },
  'toggle-playlist-8': {
    key: 'Numpad8',
    name: 'Toggle Playlist 8',
    onDown: () => togglePlaylist(8),
  },
  'toggle-playlist-9': {
    key: 'Numpad9',
    name: 'Toggle Playlist 9',
    onDown: () => togglePlaylist(9),
  },

  'next-track': {
    key: 'NumpadEnter',
    name: 'Next Track',
    onDown: nextTrack,
  },

  'increase-volume': {
    key: 'NumpadAdd',
    name: 'Increase Volume',
    onDown: increaseVolume,
    repeat: true,
  },
  'decrease-volume': {
    key: 'NumpadSubtract',
    name: 'Decrease Volume',
    onDown: decreaseVolume,
    repeat: true,
  },

  'increase-adaptive-intensity': {
    key: 'NumpadMultiply',
    name: 'Increase Adaptive Audio Intensity',
    onDown: increaseIntensity,
    repeat: true,
  },
  'decrease-adaptive-intensity': {
    key: 'NumpadDivide',
    name: 'Decrease Adaptive Audio Intensity',
    onDown: decreaseIntensity,
    repeat: true,
  },
  'toggle-mute': {
    key: 'NumpadDecimal',
    name: 'Mute/Unmute Tracked Playlists',
    onDown: toggleMute,
  },
};

export const registerNumpadKeybindings = () => {
  if (!game.keybindings) {
    return;
  }

  for (const [action, { key, name, onDown, repeat }] of Object.entries(
    NUMPAD_BINDINGS
  )) {
    game.keybindings.register(APP_NAME, action, {
      name,
      uneditable: [{ key }],
      repeat,
      onDown: () => {
        if (!canUseModule()) {
          return;
        }
        onDown();
      },
    });
  }
};
