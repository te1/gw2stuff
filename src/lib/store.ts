import { writable } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';

export const apiKey = persisted<string>('apiKey', '');

export const apiKeyValid = writable<boolean>(false);
