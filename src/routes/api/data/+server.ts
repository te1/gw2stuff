import { json } from '@sveltejs/kit';
import { makeGw2Api } from '$lib/gw2api';

export async function POST({ request, fetch }) {
  const api = await makeGw2Api(request, fetch);
  const data = await api.collect();

  return json(data);
}
