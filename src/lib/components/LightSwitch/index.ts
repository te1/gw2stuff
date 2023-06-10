// https://github.com/huntabyte/shadcn-svelte/tree/main/apps/www/src/lib/components/docs/light-switch

import { get } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';

export { default as LightSwitch } from './LightSwitch.svelte';

export const modeOsPrefers = persisted<boolean>('modeOsPrefers', false);
export const modeUserPrefers = persisted<boolean | undefined>('modeUserPrefers', undefined);
export const modeCurrent = persisted<boolean>('modeCurrent', false);

export function getModeOsPrefers(): boolean {
  const prefersLightMode = window.matchMedia('(prefers-color-scheme: light)').matches;

  modeOsPrefers.set(prefersLightMode);

  return prefersLightMode;
}

export function getModeUserPrefers(): boolean | undefined {
  return get(modeUserPrefers);
}

export function getModeAutoPrefers(): boolean {
  const os = getModeOsPrefers();
  const user = getModeUserPrefers();

  return user !== undefined ? user : os;
}

export function setModeUserPrefers(value: boolean): void {
  modeUserPrefers.set(value);
}

export function setModeCurrent(value: boolean) {
  const elemHtmlClasses = document.documentElement.classList;
  const classDark = 'dark';

  if (value === true) {
    elemHtmlClasses.remove(classDark);
  } else {
    elemHtmlClasses.add(classDark);
  }

  modeCurrent.set(value);
}

export function setInitialClassState() {
  const elemHtmlClasses = document.documentElement.classList;

  const localStorageUserPrefs = localStorage.getItem('modeUserPrefers') === 'false';
  const localStorageUserPrefsExists = !('modeUserPrefers' in localStorage);
  const matchMedia = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (localStorageUserPrefs || (localStorageUserPrefsExists && matchMedia)) {
    elemHtmlClasses.add('dark');
  } else {
    elemHtmlClasses.remove('dark');
  }
}

export function autoModeWatcher(): void {
  const mql = window.matchMedia('(prefers-color-scheme: light)');

  function setMode(value: boolean) {
    const elemHtmlClasses = document.documentElement.classList;
    const classDark = `dark`;

    if (value === true) {
      elemHtmlClasses.remove(classDark);
    } else {
      elemHtmlClasses.add(classDark);
    }
  }

  setMode(mql.matches);

  mql.onchange = () => {
    setMode(mql.matches);
  };
}
