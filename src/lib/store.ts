import { derived, get, writable } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';
import { init } from './gw2/data';
import type { DataSlim } from './gw2/transform';

export const apiKey = persisted<string>('apiKey', '');

export const apiKeyValid = writable<boolean | null>(null);

export const apiData = persisted<DataSlim | null>('apiData', null);

export interface ApiMetaData {
  accountName: string;
  fetchedAt: Date;
}

export const apiDataMeta = derived<typeof apiData, ApiMetaData | null>(apiData, ($apiData) => {
  if (!$apiData) {
    return null;
  }

  return {
    accountName: $apiData.account.name,
    fetchedAt: new Date($apiData.fetchedAt),
  };
});

export async function validateApiKey(): Promise<boolean> {
  const apiKeyValidValue = get(apiKeyValid);

  if (apiKeyValidValue) {
    // API key is already valid -> don't check again
    return true;
  }

  const apiKeyValue = get(apiKey);

  if (!apiKeyValue) {
    // API key is empty -> no need to check with server

    apiKeyValid.set(false);

    return false;
  }

  const res = await fetch('/api/validateApiKey', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey: apiKeyValue }),
  });

  const { valid } = await res.json();

  apiKeyValid.set(valid);

  return valid;
}

export async function initApiData({ forceRefresh = false } = {}) {
  let data: DataSlim | null = null;

  if (forceRefresh) {
    // force getting fresh data from server

    // delete old data in localstorage
    apiData.set(null);
  } else {
    // try to restore data from localstorage
    data = get(apiData);
  }

  if (!data) {
    // get fresh data from server if required

    const apiKeyValue = get(apiKey);
    data = await fetchApiData(apiKeyValue);

    // store data in localstorage
    apiData.set(data);
  }

  init(data);
}

async function fetchApiData(apiKey: string): Promise<DataSlim> {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey }),
  });

  const data: DataSlim = await res.json();

  return data;
}
