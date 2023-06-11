import { error, json } from '@sveltejs/kit';
import { makeGw2Api } from '$lib/gw2api';

export async function POST({ request, fetch }) {
  const api = await makeGw2Api(request, fetch);

  const characters = await api.get('v2/characters');

  if (!characters.success) {
    throw error(400, characters.message);
  }

  return json({
    success: true,
    data: characters.data,
  });
}
