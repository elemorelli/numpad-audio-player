import { APP_NAME } from './main';

export const initializeDefaultSettings = () => {
  if (!game.settings) return;

  for (let key = 1; key <= 9; key++) {
    // @ts-ignore
    if (!game.settings.settings.has(`${APP_NAME}.key_${key}_playlist`)) {
      // @ts-ignore
      game.settings.register(APP_NAME, `key_${key}_playlist`, {
        name: `Numpad Playlist ${key}`,
        scope: 'world',
        config: true,
        type: String,
        default: '',
        choices: {},
      });
    }
  }
};

export const populatePlaylistsChoices = () => {
  if (!game.settings) return;

  const playlists = game.playlists?.contents ?? [];
  const choices: Record<string, string> = { '': 'None' };

  playlists.forEach((pl) => {
    const folderName = pl.folder?.name;
    const label = folderName ? `[${folderName}] ${pl.name}` : pl.name;
    choices[pl.id] = label;
  });

  for (let key = 1; key <= 9; key++) {
    // @ts-ignore
    const currentValue = game.settings.get(APP_NAME, `key_${key}_playlist`);
    // @ts-ignore
    game.settings.settings.get(`${APP_NAME}.key_${key}_playlist`).choices =
      choices;
    // @ts-ignore
    game.settings.set(APP_NAME, `key_${key}_playlist`, currentValue);
  }
};
