import { applyTrackedPlaylistDefaults } from './utils/audio-state';
import { registerNumpadKeybindings } from './numpad-capture';
import {
  canUseModule,
  initializeDefaultSettings,
  populatePlaylistsChoices,
} from './settings';

export const APP_NAME = 'numpad-audio-player';

Hooks.once('init', async () => {
  initializeDefaultSettings();
  registerNumpadKeybindings();
});

Hooks.once('ready', async () => {
  if (!canUseModule()) {
    return;
  }

  await applyTrackedPlaylistDefaults();

  populatePlaylistsChoices();
});

Hooks.on('createPlaylist', populatePlaylistsChoices);

Hooks.on('updatePlaylist', populatePlaylistsChoices);

Hooks.on('deletePlaylist', populatePlaylistsChoices);
