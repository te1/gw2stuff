import { error } from '@sveltejs/kit';
import pLimit from 'p-limit';
import type {
  Account,
  AccountBank,
  AccountBankSlot,
  AccountInventory,
  AccountInventorySlot,
  AccountMaterial,
  CharacterCore,
  CharacterEquipmentTab,
  CharacterEquipmentTabs,
  CharacterInventoryBag,
  CharacterInventoryBags,
  CharacterInventorySlot,
  Item,
  Itemstat,
  Slot,
  Slots,
} from './types';

type Fetch = typeof fetch;

export class Gw2Api {
  constructor(private apiKey: string, private fetch: Fetch) {}

  async get<T>(endpoint: string, anonymous = false) {
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

    if (res.ok) {
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
      data: data as T,
      message,
    };
  }

  async collect() {
    const [account, characters] = await Promise.all([
      this.collectAccount(),
      this.collectCharacters(),
    ]);

    const items = await this.collectItems(account, characters);

    const itemstats = await this.collectItemstats(items, account, characters);

    return {
      account,
      characters,
      items,
      itemstats,
    };
  }

  async collectAccount() {
    const [account, inventory, bank, materials] = await Promise.all([
      this.get<Account>('v2/account/'),
      this.get<AccountInventory>('v2/account/inventory'),
      this.get<AccountBank>('v2/account/bank'),
      this.get<AccountMaterial[]>('v2/account/materials'),
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

    if (!materials.success) {
      throw error(400, 'collectAccount: materials, ' + materials.message);
    }

    return {
      name: account.data.name,
      inventory: this.filterSlots<AccountInventorySlot>(inventory.data),
      bank: this.filterSlots<AccountBankSlot>(bank.data),
      materials: this.filterMaterials(materials.data),
    };
  }

  async collectCharacters() {
    const characters = await this.get<string[]>('v2/characters');

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
    const [core, inventory, equipmenttabs] = await Promise.all([
      this.get<CharacterCore>(`v2/characters/${characterName}/core`),
      this.get<CharacterInventoryBags>(`v2/characters/${characterName}/inventory`),
      this.get<CharacterEquipmentTabs>(`v2/characters/${characterName}/equipmenttabs?tabs=all`),
    ]);

    if (!core.success) {
      throw error(400, 'collectCharacter: core, ' + core.message);
    }

    if (!inventory.success) {
      throw error(400, 'collectCharacter: inventory, ' + inventory.message);
    }

    if (!equipmenttabs.success) {
      throw error(400, 'collectCharacter: equipmenttabs, ' + equipmenttabs.message);
    }

    return {
      name: characterName,
      core: core.data,
      inventory: this.flattenBags(inventory.data.bags),
      equipmenttabs: this.filterEquipment(equipmenttabs.data),
    };
  }

  async collectItems(
    account: {
      inventory: AccountInventorySlot[];
      bank: AccountBankSlot[];
      materials: AccountMaterial[];
    },
    characters: { inventory: CharacterInventorySlot[]; equipmenttabs: CharacterEquipmentTab[] }[]
  ) {
    const ids = this.collectItemIds(account, characters);

    if (!ids.length) {
      return [];
    }

    const limit = pLimit(10);
    const tasks = [];
    const chunks = chunked(ids, 200); // api only supports 200 items at a time

    for (const chunk of chunks) {
      tasks.push(limit(() => this.get<Item[]>('v2/items?ids=' + chunk.join(','), true)));
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
    account: {
      inventory: AccountInventorySlot[];
      bank: AccountBankSlot[];
      materials: AccountMaterial[];
    },
    characters: { inventory: CharacterInventorySlot[]; equipmenttabs: CharacterEquipmentTab[] }[]
  ) {
    const ids = new Set<number>();

    for (const item of account.inventory) {
      ids.add(item.id);
    }

    for (const item of account.bank) {
      ids.add(item.id);
    }

    for (const item of account.materials) {
      ids.add(item.id);
    }

    for (const character of characters) {
      for (const item of character.inventory) {
        ids.add(item.id);
      }

      for (const tab of character.equipmenttabs) {
        for (const item of tab.equipment) {
          ids.add(item.id);
        }
      }
    }

    return Array.from(ids);
  }

  async collectItemstats(
    items: Item[],
    account: {
      inventory: AccountInventorySlot[];
      bank: AccountBankSlot[];
      materials: AccountMaterial[];
    },
    characters: { inventory: CharacterInventorySlot[]; equipmenttabs: CharacterEquipmentTab[] }[]
  ) {
    const ids = this.collectItemstatsIds(items, account, characters);

    if (!ids.length) {
      return [];
    }

    const limit = pLimit(10);
    const tasks = [];
    const chunks = chunked(ids, 200); // api only supports 200 itemstatss at a time

    for (const chunk of chunks) {
      tasks.push(limit(() => this.get<Itemstat[]>('v2/itemstats?ids=' + chunk.join(','), true)));
    }

    const results = await Promise.all(tasks);

    for (const result of results) {
      if (!result.success) {
        throw error(400, 'collectItemstats: result, ' + result.message);
      }
    }

    return results.flatMap((result) => {
      return result.data;
    });
  }

  collectItemstatsIds(
    items: Item[],
    account: {
      inventory: AccountInventorySlot[];
      bank: AccountBankSlot[];
      materials: AccountMaterial[];
    },
    characters: { inventory: CharacterInventorySlot[]; equipmenttabs: CharacterEquipmentTab[] }[]
  ) {
    const ids = new Set<number>();

    for (const item of items) {
      if (item.details?.infix_upgrade?.id) {
        ids.add(item.details?.infix_upgrade?.id);
      }
    }

    for (const item of account.bank) {
      if (item.stats?.id) {
        ids.add(item.stats?.id);
      }
    }

    for (const character of characters) {
      for (const item of character.inventory) {
        if (item.stats?.id) {
          ids.add(item.stats?.id);
        }
      }

      for (const tab of character.equipmenttabs) {
        for (const item of tab.equipment) {
          if (item.stats?.id) {
            ids.add(item.stats?.id);
          }
        }
      }
    }

    return Array.from(ids);
  }

  filterSlots<T extends Slot>(slots: Slots) {
    // filter out empty slots

    return slots.filter((slot): slot is T => {
      return slot != null;
    });
  }

  filterMaterials(materials: AccountMaterial[]) {
    return materials.filter((material) => {
      return material.count > 0;
    });
  }

  flattenBags(bags: CharacterInventoryBag[]) {
    // flatten items of all bags into one list
    // filter out empty slot

    return bags
      .flatMap((bag) => {
        return bag.inventory;
      })
      .filter((item): item is CharacterInventorySlot => {
        return item != null;
      });
  }

  filterEquipment(equipmentTabs: CharacterEquipmentTabs) {
    // filter out empty equipment tabs

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
