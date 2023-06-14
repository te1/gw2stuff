import type { AccountData, CharacterData, Data } from './collect.server';
import type {
  AccountBank,
  AccountBankSlot,
  AccountInventory,
  AccountInventorySlot,
  AccountMaterial,
  AccountMaterialSlim,
  CharacterEquipmenttab,
  CharacterEquipmenttabSlim,
  CharacterEquipmenttabs,
  CharacterInventoryBags,
  CharacterInventorySlot,
  Item,
  Itemstat,
  ItemstatAttribute,
  ItemstatAttributeSlim,
  ItemstatSlim,
  Slot,
  Slots,
} from './types';

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

function filterSlots<T extends Slot>(slots: Slots) {
  // filter out empty slots

  return slots.filter((slot): slot is T => {
    return slot != null;
  });
}

function transformAccountMaterials(materials: AccountMaterial[]): AccountMaterialSlim[] {
  return materials.map((material) => {
    const materialSlim: Partial<Pick<AccountMaterial, 'category'>> & AccountMaterialSlim = {
      ...material,
    };

    delete materialSlim.category;

    return materialSlim;
  });
}

function transformCharacters(characters: CharacterData[]) {
  return characters.map((character) => {
    return transformCharacter(character);
  });
}

function transformCharacter(character: CharacterData) {
  return {
    name: character.core.name,
    race: character.core.race,
    profession: character.core.profession,
    level: character.core.level,
    inventory: transformInventory(character.inventory),
    equipmenttabs: transformEquipmenttabs(character.equipmenttabs),
  };
}

function transformInventory(inventory: CharacterInventoryBags) {
  return (
    inventory.bags
      // flatten items of all bags into one list
      .flatMap((bag) => {
        return bag.inventory;
      })
      // filter out empty slots
      .filter((item): item is CharacterInventorySlot => {
        return item != null;
      })
      .map((slot) => {
        delete slot.dyes;

        return slot;
      })
  );
}

function transformEquipmenttabs(
  equipmentTabs: CharacterEquipmenttabs
): CharacterEquipmenttabSlim[] {
  return filterEquipmenttabs(equipmentTabs).map((tab) => {
    const tabSlim: Partial<Pick<CharacterEquipmenttab, 'equipment_pvp'>> &
      CharacterEquipmenttabSlim = {
      ...tab,
    };

    delete tabSlim.equipment_pvp;

    tabSlim.equipment = tabSlim.equipment.map((slot) => {
      delete slot.dyes;

      return slot;
    });

    return tabSlim;
  });
}

function filterEquipmenttabs(equipmentTabs: CharacterEquipmenttabs) {
  // filter out empty equipment tabs

  return equipmentTabs.filter((tab) => {
    return tab.equipment.length;
  });
}

function transformItems(items: Item[]) {
  return items;
}

function transformItemstats(itemstats: Itemstat[]) {
  return itemstats.map((stat) => {
    const statSlim: ItemstatSlim = { ...stat };

    statSlim.attributes = stat.attributes.map((attribute) => {
      const attributeSlim: Partial<Pick<ItemstatAttribute, 'value'>> & ItemstatAttributeSlim = {
        ...attribute,
      };

      delete attributeSlim.value;

      return attributeSlim;
    });

    return statSlim;
  });
}
