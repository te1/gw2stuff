type Fetch = typeof fetch;

export class Gw2Api {
  constructor(private apiKey: string, private fetch: Fetch) {}

  async get(endpoint: string) {
    const url = `https://api.guildwars2.com/${endpoint}`;

    const res = await this.fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    let success = false;
    let message = '';

    const data = await res.json();

    if (res.status === 200) {
      success = true;
    } else if (res.status === 401 || res.status === 400) {
      // 401 is returned if the API key is not present or in the wrong format
      // 400 is returned it the API key is invalid

      message = 'Invalid API key';
    } else {
      // fallback message with more error details

      message = `${res.status}: ${res.statusText}, ${data.text}`;
    }

    return {
      success,
      data,
      message,
    };
  }
}

export async function makeGw2Api(request: Request, fetch: Fetch) {
  const { apiKey } = await request.json();

  return new Gw2Api(apiKey, fetch);
}

export async function getGw2Api(endpoint: string, request: Request, fetch: Fetch) {
  const api = await makeGw2Api(request, fetch);

  return api.get(endpoint);
}
