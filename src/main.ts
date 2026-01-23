import { applyTrackedPlaylistDefaults } from './audio-state';
import { enableNumpadCapture } from './numpad-capture';
import {
  canUseModule,
  initializeDefaultSettings,
  populatePlaylistsChoices,
} from './settings';

export const APP_NAME = 'numpad-audio-player';

Hooks.once('init', async () => {
  initializeDefaultSettings();
});

Hooks.once('ready', async () => {
  if (!canUseModule()) return;

  await applyTrackedPlaylistDefaults();

  populatePlaylistsChoices();

  enableNumpadCapture();
});

Hooks.on('createPlaylist', populatePlaylistsChoices);

Hooks.on('updatePlaylist', populatePlaylistsChoices);

Hooks.on('deletePlaylist', populatePlaylistsChoices);
