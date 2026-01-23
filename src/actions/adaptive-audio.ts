const INTENSITY_STEP = 0.25;
const STING_RAMP_UP_MS = 500;
const STING_FADE_BACK_MS = 10000;
const MAX_INTENSITY = 1;
const CHANGE_FADE_MS = 300;

const isModuleActive = () => !!game.modules?.get('adaptive-audio')?.active;

const getPlayer = () => {
  // @ts-ignore
  return game.adaptiveAudio.player;
};

const changeIntensity = (delta: number) => {
  if (!isModuleActive()) return;

  const player = getPlayer();
  const current = player.intensity;
  const newIntensity = Math.clamp(current + delta, 0, 1);

  if (current === newIntensity) return;

  player.fadeTo(newIntensity, CHANGE_FADE_MS);

  const pct = Math.round(newIntensity * 100);
  ui.notifications?.info(`Adaptive Audio intensity: ${pct}%`);
};

export const increaseIntensity = () => changeIntensity(+INTENSITY_STEP);

export const decreaseIntensity = () => changeIntensity(-INTENSITY_STEP);

export const intensitySting = () => {
  if (!isModuleActive()) return;

  const player = getPlayer();
  const original = player.intensity;

  player.fadeTo(MAX_INTENSITY, STING_RAMP_UP_MS);
  ui.notifications?.info('🎵 Adaptive Audio sting');

  setTimeout(() => {
    player.fadeTo(original, STING_FADE_BACK_MS);
  }, STING_RAMP_UP_MS);
};
