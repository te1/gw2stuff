import { json } from '@sveltejs/kit';
import { makeGw2Api } from '$lib/gw2/api.server';
import { Gw2DataCollector } from '$lib/gw2/collect.server';
import { transformData } from '$lib/gw2/transform';

export async function POST({ request, fetch }) {
  const api = await makeGw2Api(request, fetch);
  const collector = new Gw2DataCollector(api);
  const data = await collector.collect();
  const result = transformData(data);

  return json(result);
}
