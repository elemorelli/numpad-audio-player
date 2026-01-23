import { APP_NAME } from './main';

export const initializeDefaultSettings = () => {
  if (!game.settings) return;

  // @ts-ignore
  game.settings.register(APP_NAME, 'minimumRole', {
    name: 'Minimum Role needed',
    hint: 'Players must have at least this role to control playlists.',
    scope: 'world',
    config: true,
    type: Number,
    requiresReload: true,
    default: CONST.USER_ROLES.ASSISTANT,
    choices: {
      [CONST.USER_ROLES.PLAYER]: 'Player',
      [CONST.USER_ROLES.TRUSTED]: 'Trusted Player',
      [CONST.USER_ROLES.ASSISTANT]: 'Assistant Gamemaster',
      [CONST.USER_ROLES.GAMEMASTER]: 'Gamemaster',
    },
  });

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

export const canUseModule = () => {
  if (!game.settings || !game.user) return;

  // @ts-ignore
  const minRole = game.settings.get(APP_NAME, 'minimumRole') as number;
  return (game.user.role ?? CONST.USER_ROLES.NONE) >= minRole;
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
