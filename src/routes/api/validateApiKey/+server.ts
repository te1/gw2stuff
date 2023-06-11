import { json } from '@sveltejs/kit';

export async function POST({ request, fetch }) {
  const { apiKey } = await request.json();

  const res = await fetch('https://api.guildwars2.com/v2/tokeninfo', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  let valid = false;
  let message = '';

  const data = await res.json();

  if (res.status === 200) {
    if (Array.isArray(data.permissions)) {
      const required = ['account', 'inventories', 'characters'];
      const pass = required.every((p) => data.permissions.includes(p));

      if (pass) {
        valid = true;
      } else {
        message = 'API key is missing permissions';
      }
    } else {
      message = 'Invalid response format';
    }
  } else if (res.status === 401 || res.status === 400) {
    // 401 is returned if the API key is not present or in the wrong format
    // 400 is returned it the API key is invalid

    message = 'Invalid API key';
  } else {
    // fallback message with more error details

    message = `${res.status}: ${res.statusText}, ${data.text}`;
  }

  return json({
    valid,
    message,
  });
}
