import { get, writable } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';

export const apiKey = persisted<string>('apiKey', '');

export const apiKeyValid = writable<boolean | null>(null);

export async function validateApiKey() {
  const apiKeyValidValue = get(apiKeyValid);

  if (apiKeyValidValue) {
    // API key is already valid -> don't check again
    return;
  }

  const apiKeyValue = get(apiKey);

  if (!apiKeyValue) {
    // API key is empty -> no need to check with server

    apiKeyValid.set(false);

    return;
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
}
