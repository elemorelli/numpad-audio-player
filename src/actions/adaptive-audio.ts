const INTENSITY_STEP = 0.25;
const CHANGE_FADE_MS = 300;

const getPlayer = () => {
  // @ts-ignore
  return game.adaptiveAudio.player;
};

const isModuleActive = () => {
  if (!game.modules?.get('adaptive-audio')?.active) {
    return false;
  }

  const player = getPlayer();

  return player?.playingSounds.size > 0;
};

const changeIntensity = (delta: number) => {
  if (!isModuleActive()) {
    return;
  }

  const player = getPlayer();
  const current = player.intensity;
  const newIntensity = Math.clamp(current + delta, 0, 1);

  if (current === newIntensity) {
    return;
  }

  player.fadeTo(newIntensity, CHANGE_FADE_MS);

  const pct = Math.round(newIntensity * 100);
  ui.notifications?.info(`🎚️ Adaptive Audio intensity: ${pct}%`);
};

export const increaseIntensity = () => changeIntensity(+INTENSITY_STEP);

export const decreaseIntensity = () => changeIntensity(-INTENSITY_STEP);
