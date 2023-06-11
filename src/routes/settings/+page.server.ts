import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';

const schema = z.object({
  apiKey: z.string().trim().length(72),
});

export async function load() {
  const form = await superValidate(schema);

  return { form };
}

export const actions = {
  async default({ request, fetch }) {
    const form = await superValidate(request, schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    const apiKey = form.data.apiKey;

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

    return {
      form,
      valid,
      message,
    };
  },
};
