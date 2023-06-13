import { makeGw2Api } from '$lib/gw2/api.server';
import { json } from '@sveltejs/kit';

export async function POST({ request, fetch }) {
  const api = await makeGw2Api(request, fetch);
  const res = await api.tokeninfo();

  let valid = false;
  let message = res.message;

  if (res.success) {
    if (Array.isArray(res.data.permissions)) {
      const required = ['account', 'inventories', 'characters'];
      const pass = required.every((p) => res.data.permissions.includes(p));

      if (pass) {
        valid = true;
      } else {
        message = 'API key is missing permissions';
      }
    } else {
      message = 'Invalid response format';
    }
  }

  return json({
    valid,
    message,
  });
}
