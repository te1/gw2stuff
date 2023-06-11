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

    const res = await fetch('/api/validateApiKey', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    const { valid, message } = await res.json();

    return {
      form,
      valid,
      message,
    };
  },
};
