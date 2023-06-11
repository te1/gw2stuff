type Fetch = typeof fetch;

export async function sendRequest(endpoint: string, request: Request, fetch: Fetch) {
  const url = `https://api.guildwars2.com/${endpoint}`;
  const { apiKey } = await request.json();

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
