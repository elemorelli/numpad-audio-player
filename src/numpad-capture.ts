import {
  decreaseAdaptiveAudioIntensity,
  decreaseVolume,
  increaseAdaptiveAudioIntensity,
  increaseVolume,
  nextTrack,
  stopTrackedPlaylists,
  togglePlaylist,
} from './actions';

type NumpadAction = () => void | Promise<void>;

let enabled = false;

const NUMPAD_ACTIONS: Record<string, NumpadAction> = {
  Numpad0: stopTrackedPlaylists,

  Numpad1: () => togglePlaylist(1),
  Numpad2: () => togglePlaylist(2),
  Numpad3: () => togglePlaylist(3),
  Numpad4: () => togglePlaylist(4),
  Numpad5: () => togglePlaylist(5),
  Numpad6: () => togglePlaylist(6),
  Numpad7: () => togglePlaylist(7),
  Numpad8: () => togglePlaylist(8),
  Numpad9: () => togglePlaylist(9),

  NumpadEnter: nextTrack,

  NumpadAdd: increaseVolume,
  NumpadSubtract: decreaseVolume,

  NumpadMultiply: increaseAdaptiveAudioIntensity,
  NumpadDivide: decreaseAdaptiveAudioIntensity,
};

const handleNumpadEvent = (event: KeyboardEvent) => {
  if (event.code === 'NumLock') {
    enabled = !event.getModifierState('NumLock');
    return;
  }

  if (!enabled) return;

  const action = NUMPAD_ACTIONS[event.code];
  if (!action) return;

  action();
};

export const enableNumpadCapture = () => {
  if (enabled) return;
  enabled = true;

  window.addEventListener(
    'keydown',
    (event) => {
      if (!event.code.startsWith('Numpad') && event.code !== 'NumLock') return;

      event.preventDefault();
      event.stopImmediatePropagation();

      handleNumpadEvent(event);
    },
    true
  );
};
