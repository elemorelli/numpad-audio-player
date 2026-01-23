import { APP_NAME } from './main';

export enum ModuleSetting {
  MINIMUM_ROLE = 'minimumRole',
  AUTO_INIT = 'autoInitPlaylists',
  GLOBAL_VOLUME = 'globalVolume',
  FADE_DURATION = 'fadeDuration',
  KEY_1_PLAYLIST = 'key_1_playlist',
  KEY_2_PLAYLIST = 'key_2_playlist',
  KEY_3_PLAYLIST = 'key_3_playlist',
  KEY_4_PLAYLIST = 'key_4_playlist',
  KEY_5_PLAYLIST = 'key_5_playlist',
  KEY_6_PLAYLIST = 'key_6_playlist',
  KEY_7_PLAYLIST = 'key_7_playlist',
  KEY_8_PLAYLIST = 'key_8_playlist',
  KEY_9_PLAYLIST = 'key_9_playlist',
}

const NUMPAD_PLAYLIST_SETTINGS = [
  ModuleSetting.KEY_1_PLAYLIST,
  ModuleSetting.KEY_2_PLAYLIST,
  ModuleSetting.KEY_3_PLAYLIST,
  ModuleSetting.KEY_4_PLAYLIST,
  ModuleSetting.KEY_5_PLAYLIST,
  ModuleSetting.KEY_6_PLAYLIST,
  ModuleSetting.KEY_7_PLAYLIST,
  ModuleSetting.KEY_8_PLAYLIST,
  ModuleSetting.KEY_9_PLAYLIST,
];

type SettingType = StringConstructor | NumberConstructor | BooleanConstructor;

export const ModuleSettings = {
  defaultRegisterOptions: {
    scope: 'world' as const,
    requiresReload: true,
    config: true,
  },

  register: <T extends boolean | number | string>(
    key: ModuleSetting,
    data: {
      name: string;
      hint?: string;
      type: SettingType;
      scope?: 'world' | 'client';
      config?: boolean;
      requiresReload?: Boolean;
      default: T;
      choices?: Record<string, string>;
      range?: { min: number; max: number; step: number };
      onChange?: (value: T) => void;
    }
  ) => {
    if (!game.settings) return;

    const options = {
      ...ModuleSettings.defaultRegisterOptions,
      ...data,
    };
    // @ts-ignore
    game.settings.register(APP_NAME, key, options);
  },

  has: <T extends boolean | number | string>(key: ModuleSetting) => {
    if (!game.settings) return undefined;
    // @ts-ignore
    return game.settings.settings.has(`${APP_NAME}.${key}`) as T;
  },

  get: <T extends boolean | number | string>(key: ModuleSetting) => {
    if (!game.settings) return undefined;
    // @ts-ignore
    return game.settings.get(APP_NAME, key) as T;
  },

  set: <T extends boolean | number | string>(key: ModuleSetting, value: T) => {
    if (!game.settings) return;
    // @ts-ignore
    return game.settings.set(APP_NAME, key, value);
  },

  getPlaylist: (key: ModuleSetting): foundry.documents.Playlist | null => {
    if (!game.settings || !game.playlists) return null;
    // @ts-ignore
    const id = game.settings.get(APP_NAME, key);
    if (!id) return null;
    return game.playlists.get(id as string) ?? null;
  },

  getPlaylistKey: (numpad: number): ModuleSetting | null => {
    if (numpad < 1 || numpad > 9) return null;
    return NUMPAD_PLAYLIST_SETTINGS[numpad - 1] ?? null;
  },
};

export const initializeDefaultSettings = () => {
  ModuleSettings.register(ModuleSetting.MINIMUM_ROLE, {
    name: 'Minimum Role needed',
    hint: 'Players must have at least this role to control playlists.',
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

  ModuleSettings.register(ModuleSetting.AUTO_INIT, {
    name: 'Auto-Initialize Tracked Playlists',
    hint: 'If enabled, the module will automatically initialize playlists that have been assigned to numpad keys when the game starts. Only affects the tracked playlists.',
    type: Boolean,
    default: true,
  });

  ModuleSettings.register(ModuleSetting.GLOBAL_VOLUME, {
    name: 'Default Volume for Tracked Playlists',
    hint: 'Sets the initial volume for playlists that are assigned to numpad keys when starting or resuming playback.',

    type: Number,
    default: 0.7,
    range: {
      min: 0,
      max: 1,
      step: 0.01,
    },
  });

  ModuleSettings.register(ModuleSetting.FADE_DURATION, {
    name: 'Fade Duration for Tracked Playlists (ms)',
    hint: 'Time in milliseconds used for fade-in/fade-out when starting or stopping playlists assigned to numpad keys.',
    type: Number,
    default: 2000,
    range: {
      min: 0,
      max: 10000,
      step: 100,
    },
  });

  for (const key of NUMPAD_PLAYLIST_SETTINGS) {
    if (!ModuleSettings.has(key)) {
      ModuleSettings.register(key, {
        name: `Numpad Playlist ${key.split('_')[1]}`,
        type: String,
        requiresReload: false,
        default: '',
        choices: {},
      });
    }
  }
};

export const canUseModule = () => {
  if (!game.user) return;

  const minRole = ModuleSettings.get(ModuleSetting.MINIMUM_ROLE) as number;
  return (game.user.role ?? CONST.USER_ROLES.NONE) >= minRole;
};

export const populatePlaylistsChoices = () => {
  const playlists = game.playlists?.contents ?? [];
  const choices: Record<string, string> = { '': 'None' };

  playlists.forEach((pl) => {
    const folderName = pl.folder?.name;
    const label = folderName ? `[${folderName}] ${pl.name}` : pl.name;
    choices[pl.id] = label;
  });

  NUMPAD_PLAYLIST_SETTINGS.forEach((key) => {
    const currentValue = ModuleSettings.get(key) ?? '';

    ModuleSettings.register(key, {
      name: `Numpad Playlist ${key.split('_')[1]}`,
      type: String,
      default: '',
      choices,
    });

    ModuleSettings.set(key, currentValue);
  });
};
