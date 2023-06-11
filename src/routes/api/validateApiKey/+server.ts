import { getGw2Api } from '$lib/gw2api';
import { json } from '@sveltejs/kit';

export async function POST({ request, fetch }) {
  const res = await getGw2Api('v2/tokeninfo', request, fetch);

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
