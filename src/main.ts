import { initializeTrackedPlaylists } from './audio-state';
import { enableNumpadCapture } from './numpad-capture';

const DEV = true;

Hooks.once('ready', async () => {
  if (DEV) console.clear();

  await initializeTrackedPlaylists();

  enableNumpadCapture();
});
