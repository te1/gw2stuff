import { error } from '@sveltejs/kit';
import pLimit from 'p-limit';
import type {
  AccountBankSlot,
  AccountInventorySlot,
  AccountMaterial,
  CharacterEquipmenttab,
  CharacterEquipmenttabs,
  CharacterInventoryBag,
  CharacterInventorySlot,
  Item,
  Slot,
  Slots,
} from './types';
import type { Gw2Api } from './api.server';

export class Gw2DataCollector {
  constructor(private api: Gw2Api) {}

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
      name: account.data.name,
      inventory: this.filterSlots<AccountInventorySlot>(inventory.data),
      bank: this.filterSlots<AccountBankSlot>(bank.data),
      materials: this.filterMaterials(materials.data),
    };
  }

  async collectCharacters() {
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

  async collectCharacter(characterName: string) {
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
    characters: { inventory: CharacterInventorySlot[]; equipmenttabs: CharacterEquipmenttab[] }[]
  ) {
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

  private collectItemIds(
    account: {
      inventory: AccountInventorySlot[];
      bank: AccountBankSlot[];
      materials: AccountMaterial[];
    },
    characters: { inventory: CharacterInventorySlot[]; equipmenttabs: CharacterEquipmenttab[] }[]
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
    characters: { inventory: CharacterInventorySlot[]; equipmenttabs: CharacterEquipmenttab[] }[]
  ) {
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

  private collectItemstatsIds(
    items: Item[],
    account: {
      inventory: AccountInventorySlot[];
      bank: AccountBankSlot[];
      materials: AccountMaterial[];
    },
    characters: { inventory: CharacterInventorySlot[]; equipmenttabs: CharacterEquipmenttab[] }[]
  ) {
    const ids = new Set<number>();

    for (const item of items) {
      if (item.details && 'infix_upgrade' in item.details && item.details.infix_upgrade?.id) {
        ids.add(item.details.infix_upgrade.id);
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

  private filterSlots<T extends Slot>(slots: Slots) {
    // filter out empty slots

    return slots.filter((slot): slot is T => {
      return slot != null;
    });
  }

  private filterMaterials(materials: AccountMaterial[]) {
    return materials.filter((material) => {
      return material.count > 0;
    });
  }

  private flattenBags(bags: CharacterInventoryBag[]) {
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

  private filterEquipment(equipmentTabs: CharacterEquipmenttabs) {
    // filter out empty equipment tabs

    return equipmentTabs.filter((tab) => {
      return tab.equipment.length;
    });
  }
}

function chunked<T>(array: T[], n: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += n) {
    chunks.push(array.slice(i, i + n));
  }

  return chunks;
}
