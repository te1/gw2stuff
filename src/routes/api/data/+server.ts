import { error, json } from '@sveltejs/kit';
import { sendRequest } from '$lib/gw2api';

export async function POST({ request, fetch }) {
  const characters = await sendRequest('v2/characters', request, fetch);

  if (!characters.success) {
    throw error(400, characters.message);
  }

  return json({
    success: true,
    data: characters.data,
  });
}
