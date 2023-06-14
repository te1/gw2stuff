import type { AccountData, CharacterData, Data } from './collect.server';
import type {
  AccountBank,
  AccountBankSlot,
  AccountBankSlotSlim,
  AccountInventory,
  AccountInventorySlot,
  AccountMaterial,
  AccountMaterialSlim,
  CharacterEquipmentSlot,
  CharacterEquipmentSlotSlim,
  CharacterEquipmenttab,
  CharacterEquipmenttabSlim,
  CharacterEquipmenttabs,
  CharacterInventoryBags,
  CharacterInventorySlot,
  CharacterInventorySlotSlim,
  Item,
  ItemSlim,
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

function transformAccountBank(bank: AccountBank): AccountBankSlotSlim[] {
  return filterSlots<AccountBankSlot>(bank).map((slot) => {
    const slotSlim: Partial<Pick<AccountBankSlot, 'dyes'>> & AccountBankSlotSlim = {
      ...slot,
    };

    delete slotSlim.dyes;

    return slotSlim;
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

function transformInventory(inventory: CharacterInventoryBags): CharacterInventorySlotSlim[] {
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
        const slotSlim: Partial<Pick<CharacterInventorySlot, 'dyes'>> & CharacterInventorySlotSlim =
          { ...slot };

        delete slotSlim.dyes;

        return slotSlim;
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

    tabSlim.equipment = tab.equipment.map((slot) => {
      const slotSlim: Partial<Pick<CharacterEquipmentSlot, 'dyes'>> & CharacterEquipmentSlotSlim = {
        ...slot,
      };

      delete slotSlim.dyes;

      return slotSlim;
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

function transformItems(items: Item[]): ItemSlim[] {
  return items.map((item) => {
    const itemSlim: Partial<
      Pick<
        Item,
        | 'description'
        | 'upgrades_from'
        | 'upgrades_into'
        | 'chat_link'
        | 'game_types'
        | 'flags'
        | 'vendor_value'
      >
    > &
      ItemSlim = { ...item };

    delete itemSlim.description;
    delete itemSlim.upgrades_from;
    delete itemSlim.upgrades_into;
    delete itemSlim.chat_link;
    delete itemSlim.flags;
    delete itemSlim.game_types;
    delete itemSlim.vendor_value;

    if (!itemSlim.restrictions?.length) {
      delete itemSlim.restrictions;
    }

    // item.details ...

    return itemSlim;
  });
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
