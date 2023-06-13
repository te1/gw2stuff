import type { AccountData, CharacterData, Data } from './collect.server';
import type {
  AccountBank,
  AccountBankSlot,
  AccountInventory,
  AccountInventorySlot,
  AccountMaterial,
  Item,
  Itemstat,
  Slot,
  Slots,
} from './types';

export type SlimAccountMaterial = Omit<AccountMaterial, 'category'>;

export function transformData(data: Data) {
  return {
    account: transformAccount(data.account),
    characters: transformCharacters(data.characters),
    items: transformItems(data.items),
    itemstats: transformItemstats(data.itemstats),
  };
}

function transformAccount(account: AccountData) {
  return {
    name: account.account.name,
    inventory: transformAccountInventory(account.inventory),
    bank: transformAccountBank(account.bank),
    materials: transformAccountMaterials(account.materials),
  };
}

function transformAccountInventory(inventory: AccountInventory) {
  return filterSlots<AccountInventorySlot>(inventory);
}

function transformAccountBank(bank: AccountBank) {
  return filterSlots<AccountBankSlot>(bank).map((slot) => {
    delete slot.dyes;

    return slot;
  });
}

function transformAccountMaterials(materials: AccountMaterial[]): SlimAccountMaterial[] {
  return materials.map((material) => {
    const slimMaterial: Partial<Pick<AccountMaterial, 'category'>> & SlimAccountMaterial = {
      ...material,
    };

    delete slimMaterial.category;

    return slimMaterial;
  });
}

function transformCharacters(characters: CharacterData[]) {
  return characters;
}

function transformItems(items: Item[]) {
  return items;
}

function transformItemstats(itemstats: Itemstat[]) {
  return itemstats;
}

// return {
//   core: core.data,
//   inventory: this.flattenBags(inventory.data.bags),
//   equipmenttabs: this.filterEquipment(equipmenttabs.data),
// };

function filterSlots<T extends Slot>(slots: Slots) {
  // filter out empty slots

  return slots.filter((slot): slot is T => {
    return slot != null;
  });
}

// private flattenBags(bags: CharacterInventoryBag[]) {
//   // flatten items of all bags into one list
//   // filter out empty slot

//   return bags
//     .flatMap((bag) => {
//       return bag.inventory;
//     })
//     .filter((item): item is CharacterInventorySlot => {
//       return item != null;
//     });
// }

// private filterEquipment(equipmentTabs: CharacterEquipmenttabs) {
//   // filter out empty equipment tabs

//   return equipmentTabs.filter((tab) => {
//     return tab.equipment.length;
//   });
// }
