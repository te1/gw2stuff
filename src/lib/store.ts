import { get, writable } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';

export const apiKey = persisted<string>('apiKey', '');

export const apiKeyValid = writable<boolean | null>(null);

export async function updateValidateApiKey() {
  const res = await fetch('/api/validateApiKey', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey: get(apiKey) }),
  });

  const { valid } = await res.json();

  apiKeyValid.set(valid);
}
