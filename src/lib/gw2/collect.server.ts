import { error } from '@sveltejs/kit';
import pLimit from 'p-limit';
import type { Gw2Api } from './api.server';
import type {
  Account,
  AccountBank,
  AccountInventory,
  AccountMaterial,
  CharacterCore,
  CharacterEquipmenttab,
  CharacterInventoryBags,
  Item,
  Itemstat,
} from './types';

interface Data {
  account: AccountData;
  characters: CharacterData[];
  items: Item[];
  itemstats: Itemstat[];
}

interface AccountData {
  account: Account;
  inventory: AccountInventory;
  bank: AccountBank;
  materials: AccountMaterial[];
}

interface CharacterData {
  core: CharacterCore;
  inventory: CharacterInventoryBags;
  equipmenttabs: CharacterEquipmenttab[];
}

export class Gw2DataCollector {
  constructor(private api: Gw2Api) {}

  async collect(): Promise<Data> {
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

  async collectAccount(): Promise<AccountData> {
    const [account, inventory, bank, materials] = await Promise.all([
      this.api.account(),
      this.api.accountInventory(),
      this.api.accountBank(),
      this.api.accountMaterials(),
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
      account: account.data,
      inventory: inventory.data,
      bank: bank.data,
      materials: materials.data,
    };
  }

  async collectCharacters(): Promise<CharacterData[]> {
    const characters = await this.api.characterNames();

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

  async collectCharacter(characterName: string): Promise<CharacterData> {
    const [core, inventory, equipmenttabs] = await Promise.all([
      this.api.characterCore(characterName),
      this.api.characterInventory(characterName),
      this.api.characterEquipmenttabs(characterName),
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
      core: core.data,
      inventory: inventory.data,
      equipmenttabs: equipmenttabs.data,
    };
  }

  async collectItems(account: AccountData, characters: CharacterData[]): Promise<Item[]> {
    const ids = this.collectItemIds(account, characters);

    if (!ids.length) {
      return [];
    }

    const limit = pLimit(10);
    const tasks = [];
    const chunks = chunked(ids, 200); // api only supports 200 items at a time

    for (const chunk of chunks) {
      tasks.push(limit(() => this.api.items(chunk)));
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

  private collectItemIds(account: AccountData, characters: CharacterData[]) {
    const ids = new Set<number>();

    for (const item of account.inventory) {
      if (item && item.count > 0) {
        ids.add(item.id);
      }
    }

    for (const item of account.bank) {
      if (item && item.count > 0) {
        ids.add(item.id);
      }
    }

    for (const item of account.materials) {
      if (item.count > 0) {
        ids.add(item.id);
      }
    }

    for (const character of characters) {
      for (const bag of character.inventory.bags) {
        for (const item of bag.inventory) {
          if (item && item.count > 0) {
            ids.add(item.id);
          }
        }
      }

      for (const tab of character.equipmenttabs) {
        for (const item of tab.equipment) {
          if (item.count > 0) {
            ids.add(item.id);
          }
        }
      }
    }

    return Array.from(ids);
  }

  async collectItemstats(
    items: Item[],
    account: AccountData,
    characters: CharacterData[]
  ): Promise<Itemstat[]> {
    const ids = this.collectItemstatsIds(items, account, characters);

    if (!ids.length) {
      return [];
    }

    const limit = pLimit(10);
    const tasks = [];
    const chunks = chunked(ids, 200); // api only supports 200 itemstatss at a time

    for (const chunk of chunks) {
      tasks.push(limit(() => this.api.itemstats(chunk)));
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

  private collectItemstatsIds(items: Item[], account: AccountData, characters: CharacterData[]) {
    const ids = new Set<number>();

    for (const item of items) {
      if (item.details && 'infix_upgrade' in item.details && item.details.infix_upgrade?.id) {
        ids.add(item.details.infix_upgrade.id);
      }
    }

    for (const item of account.bank) {
      if (item && item.stats?.id) {
        ids.add(item.stats?.id);
      }
    }

    for (const character of characters) {
      for (const bag of character.inventory.bags) {
        for (const item of bag.inventory) {
          if (item && item.stats?.id) {
            ids.add(item.stats?.id);
          }
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
}

function chunked<T>(array: T[], n: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += n) {
    chunks.push(array.slice(i, i + n));
  }

  return chunks;
}
