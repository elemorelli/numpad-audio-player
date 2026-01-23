import { initializeTrackedPlaylists } from './audio-state';
import { enableNumpadCapture } from './numpad-capture';
import {
  initializeDefaultSettings,
  populatePlaylistsChoices,
} from './settings';

export const APP_NAME = 'numpad-audio-player';

Hooks.once('init', async () => {
  initializeDefaultSettings();
});

Hooks.once('ready', async () => {
  await initializeTrackedPlaylists();

  populatePlaylistsChoices();

  enableNumpadCapture();
});

Hooks.on('createPlaylist', populatePlaylistsChoices);

Hooks.on('updatePlaylist', populatePlaylistsChoices);

Hooks.on('deletePlaylist', populatePlaylistsChoices);
