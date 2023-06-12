import { error } from '@sveltejs/kit';
import pLimit from 'p-limit';

type Fetch = typeof fetch;

export class Gw2Api {
  constructor(private apiKey: string, private fetch: Fetch) {}

  async get(endpoint: string, anonymous = false) {
    const url = `https://api.guildwars2.com/${endpoint}`;

    const opts: RequestInit = {};
    if (!anonymous) {
      opts.headers = {
        Authorization: `Bearer ${this.apiKey}`,
      };
    }

    const res = await this.fetch(url, opts);

    let success = false;
    let message = '';

    const data = await res.json();

    if (res.status === 200) {
      success = true;
    } else if (res.status === 401 || res.status === 400) {
      // 401 is returned if the API key is not present or in the wrong format
      // 400 is returned it the API key is invalid
      // 400 is also returned if other request parameters are invalid

      if (data.text === 'invalid key') {
        message = 'Invalid API key'; // nicer message
      } else {
        message = data.text;
      }
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

  async collect() {
    const [account, characters] = await Promise.all([
      this.collectAccount(),
      this.collectCharacters(),
    ]);

    const items = await this.collectItems(account, characters);

    return {
      account,
      characters,
      items,
    };
  }

  async collectAccount() {
    const [account, inventory, bank] = await Promise.all([
      this.get('v2/account/'),
      this.get('v2/account/inventory'),
      this.get('v2/account/bank'),
    ]);

    if (!account.success) {
      throw error(400, 'collectAccount: account, ' + account.message);
    }

    if (!inventory.success) {
      throw error(400, 'collectAccount: inventory, ' + inventory.message);
    }

    if (!bank.success) {
      throw error(400, 'collectAccount: bank, ' + bank.message);
    }

    return {
      name: account.data?.name as string,
      inventory: this.filterItems(inventory.data),
      bank: this.filterItems(bank.data),
    };
  }

  async collectCharacters() {
    const characters = await this.get('v2/characters');

    if (!characters.success) {
      throw error(400, 'collectCharacters: characters, ' + characters.message);
    }

    const limit = pLimit(10);
    const tasks = [];

    for (const characterName of characters.data) {
      tasks.push(limit(() => this.collectCharacter(characterName)));
    }

    return Promise.all(tasks);
  }

  async collectCharacter(characterName: string) {
    const [inventory, equipmenttabs] = await Promise.all([
      this.get(`v2/characters/${characterName}/inventory`),
      this.get(`v2/characters/${characterName}/equipmenttabs?tabs=all`),
    ]);

    if (!inventory.success) {
      throw error(400, 'collectCharacter: inventory, ' + inventory.message);
    }

    if (!equipmenttabs.success) {
      throw error(400, 'collectCharacter: equipmenttabs, ' + equipmenttabs.message);
    }

    return {
      name: characterName,
      inventory: this.flattenBags(inventory.data.bags),
      equipment: this.filterEquipment(equipmenttabs.data),
    };
  }

  async collectItems(
    account: { inventory: { id: number }[]; bank: { id: number }[] },
    characters: { inventory: { id: number }[]; equipment: { equipment: { id: number }[] }[] }[]
  ) {
    const ids = this.collectItemIds(account, characters);

    if (!ids.length) {
      return [];
    }

    const limit = pLimit(10);
    const tasks = [];
    const chunks = chunked(ids, 200); // api only supports 200 items at a time

    for (const chunk of chunks) {
      tasks.push(limit(() => this.get('v2/items?ids=' + chunk.join(','), true)));
    }

    const results = await Promise.all(tasks);

    for (const result of results) {
      if (!result.success) {
        throw error(400, 'collectItems: result, ' + result.message);
      }
    }

    return results.flatMap((result) => {
      return result.data;
    });
  }

  collectItemIds(
    account: { inventory: { id: number }[]; bank: { id: number }[] },
    characters: { inventory: { id: number }[]; equipment: { equipment: { id: number }[] }[] }[]
  ) {
    const ids = new Set<number>();

    for (const item of account.inventory) {
      ids.add(item.id);
    }

    for (const item of account.bank) {
      ids.add(item.id);
    }

    for (const character of characters) {
      for (const item of character.inventory) {
        ids.add(item.id);
      }

      for (const tab of character.equipment) {
        for (const item of tab.equipment) {
          ids.add(item.id);
        }
      }
    }

    return Array.from(ids);
  }

  filterItems(items: object[]) {
    return items.filter((item) => {
      return item != null;
    });
  }

  flattenBags(bags: { inventory: object[] }[]) {
    return bags
      .flatMap((bag) => {
        return bag.inventory;
      })
      .filter((item) => {
        return item != null;
      });
  }

  filterEquipment(equipmentTabs: { equipment: object[] }[]) {
    return equipmentTabs.filter((tab) => {
      return tab.equipment.length;
    });
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

function chunked<T>(array: T[], n: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += n) {
    chunks.push(array.slice(i, i + n));
  }

  return chunks;
}
