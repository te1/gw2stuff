import type { AccountData, CharacterData, Data } from './collect.server';
import type {
  AccountBank,
  AccountBankSlot,
  AccountInventory,
  AccountInventorySlot,
  AccountMaterial,
  CharacterEquipmenttabSlot,
  CharacterEquipmenttab,
  CharacterEquipmenttabs,
  CharacterInventoryBags,
  CharacterInventorySlot,
  CharacterProfession,
  CharacterRace,
  Item,
  ItemDetailsArmor,
  ItemDetailsBack,
  ItemDetailsBag,
  ItemDetailsConsumable,
  ItemDetailsGizmo,
  ItemDetailsSalvageKit,
  ItemDetailsTrinket,
  ItemDetailsUpgradeComponent,
  ItemDetailsWeapon,
  Itemstat,
  ItemstatAttribute,
  Slot,
  Slots,
  CharacterEquipment,
} from './types';
import type {
  AccountBankSlotSlim,
  AccountMaterialSlim,
  CharacterEquipmentSlotSlim,
  CharacterEquipmenttabSlim,
  CharacterInventorySlotSlim,
  ItemDetailsArmorSlim,
  ItemDetailsBackSlim,
  ItemDetailsBagSlim,
  ItemDetailsConsumableSlim,
  ItemDetailsGizmoSlim,
  ItemDetailsSalvageKitSlim,
  ItemDetailsSlim,
  ItemDetailsTrinketSlim,
  ItemDetailsUpgradeComponentSlim,
  ItemDetailsWeaponSlim,
  ItemSlim,
  ItemstatAttributeSlim,
  ItemstatSlim,
} from './typesSlim';

export interface DataSlim {
  account: AccountDataSlim;
  characters: CharacterDataSlim[];
  items: ItemSlim[];
  itemstats: ItemstatSlim[];
  fetchedAt: string;
}

export interface AccountDataSlim {
  name: string;
  inventory: AccountInventorySlot[];
  bank: AccountBankSlotSlim[];
  materials: AccountMaterialSlim[];
}

export interface CharacterDataSlim {
  name: string;
  race: CharacterRace;
  profession: CharacterProfession;
  level: number;
  inventory: CharacterInventorySlotSlim[];
  equipmenttabs: CharacterEquipmenttabSlim[];
  gatheringTools: CharacterGatheringTool[];
}

export interface CharacterGatheringTool {
  id: number;
  slot: 'Sickle' | 'Axe' | 'Pick';
  binding?: 'Character' | 'Account';
  charges?: number;
}

export function transformData(data: Data): DataSlim {
  return {
    account: transformAccount(data.account),
    characters: transformCharacters(data.characters),
    items: transformItems(data.items),
    itemstats: transformItemstats(data.itemstats),
    fetchedAt: data.fetchedAt,
  };
}

function transformAccount(account: AccountData): AccountDataSlim {
  return {
    name: account.account.name,
    inventory: transformAccountInventory(account.inventory),
    bank: transformAccountBank(account.bank),
    materials: transformAccountMaterials(account.materials),
  };
}

function transformAccountInventory(inventory: AccountInventory): AccountInventorySlot[] {
  return filterSlots<AccountInventorySlot>(inventory);
}

function transformAccountBank(bank: AccountBank): AccountBankSlotSlim[] {
  return filterSlots<AccountBankSlot>(bank).map((slot) => {
    const slotSlim: Partial<Pick<AccountBankSlot, 'dyes'>> & AccountBankSlotSlim = { ...slot };

    delete slotSlim.dyes;

    return slotSlim;
  });
}

function filterSlots<T extends Slot>(slots: Slots): T[] {
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

function transformCharacters(characters: CharacterData[]): CharacterDataSlim[] {
  return characters.map((character) => {
    return transformCharacter(character);
  });
}

function transformCharacter(character: CharacterData): CharacterDataSlim {
  return {
    name: character.core.name,
    race: character.core.race,
    profession: character.core.profession,
    level: character.core.level,
    inventory: transformInventory(character.inventory),
    equipmenttabs: transformEquipmenttabs(character.equipmenttabs),
    gatheringTools: transformEquipment(character.equipment),
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
      CharacterEquipmenttabSlim = { ...tab };

    delete tabSlim.equipment_pvp;

    tabSlim.equipment = tab.equipment.map((slot) => {
      const slotSlim: Partial<Pick<CharacterEquipmenttabSlot, 'dyes'>> &
        CharacterEquipmentSlotSlim = {
        ...slot,
      };

      delete slotSlim.dyes;

      return slotSlim;
    });

    return tabSlim;
  });
}

function filterEquipmenttabs(equipmentTabs: CharacterEquipmenttabs): CharacterEquipmenttab[] {
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

    itemSlim.details = transformItemDetails(item);

    return itemSlim;
  });
}

function transformEquipment(equipment: CharacterEquipment): CharacterGatheringTool[] {
  const result: CharacterGatheringTool[] = [];

  for (const slot of equipment.equipment) {
    if (slot.slot === 'Sickle' || slot.slot === 'Axe' || slot.slot === 'Pick') {
      result.push({
        id: slot.id,
        slot: slot.slot,
        binding: slot.binding,
        charges: slot.charges,
      });
    }
  }

  return result;
}

function transformItemDetails(item: Item): ItemDetailsSlim | undefined {
  if (!item.details) {
    return;
  }

  switch (item.type) {
    case 'Armor': {
      const detailsSlim: Partial<Pick<ItemDetailsArmor, 'attribute_adjustment'>> &
        ItemDetailsArmorSlim = { ...item.details };

      delete detailsSlim.attribute_adjustment;

      if (!detailsSlim.infusion_slots?.length) {
        delete detailsSlim.infusion_slots;
      }

      if (!detailsSlim.secondary_suffix_item_id) {
        delete detailsSlim.secondary_suffix_item_id;
      }

      return detailsSlim;
    }

    case 'Back': {
      const detailsSlim: Partial<Pick<ItemDetailsBack, 'attribute_adjustment'>> &
        ItemDetailsBackSlim = { ...item.details };

      delete detailsSlim.attribute_adjustment;

      if (!detailsSlim.infusion_slots?.length) {
        delete detailsSlim.infusion_slots;
      }

      if (!detailsSlim.secondary_suffix_item_id) {
        delete detailsSlim.secondary_suffix_item_id;
      }

      return detailsSlim;
    }

    case 'Bag': {
      const detailsSlim: Partial<Pick<ItemDetailsBag, 'no_sell_or_sort'>> & ItemDetailsBagSlim = {
        ...item.details,
      };

      delete detailsSlim.no_sell_or_sort;

      return detailsSlim;
    }

    case 'Consumable': {
      const detailsSlim: Partial<
        Pick<
          ItemDetailsConsumable,
          | 'description'
          | 'duration_ms'
          | 'color_id'
          | 'recipe_id'
          | 'extra_recipe_ids'
          | 'guild_upgrade_id'
          | 'apply_count'
          | 'skins'
        >
      > &
        ItemDetailsConsumableSlim = { ...item.details };

      delete detailsSlim.description;
      delete detailsSlim.duration_ms;
      delete detailsSlim.color_id;
      delete detailsSlim.recipe_id;
      delete detailsSlim.extra_recipe_ids;
      delete detailsSlim.guild_upgrade_id;
      delete detailsSlim.apply_count;
      delete detailsSlim.skins;

      return detailsSlim;
    }

    case 'Gizmo': {
      const detailsSlim: Partial<Pick<ItemDetailsGizmo, 'guild_upgrade_id' | 'vendor_ids'>> &
        ItemDetailsGizmoSlim = { ...item.details };

      delete detailsSlim.guild_upgrade_id;
      delete detailsSlim.vendor_ids;

      return detailsSlim;
    }

    case 'Tool': {
      const detailsSlim: Partial<Pick<ItemDetailsSalvageKit, 'type'>> & ItemDetailsSalvageKitSlim =
        { ...item.details };

      delete detailsSlim.type;

      return detailsSlim;
    }

    case 'Trinket': {
      const detailsSlim: Partial<Pick<ItemDetailsTrinket, 'attribute_adjustment'>> &
        ItemDetailsTrinketSlim = { ...item.details };

      delete detailsSlim.attribute_adjustment;

      if (!detailsSlim.infusion_slots?.length) {
        delete detailsSlim.infusion_slots;
      }

      if (!detailsSlim.secondary_suffix_item_id) {
        delete detailsSlim.secondary_suffix_item_id;
      }

      return detailsSlim;
    }

    case 'UpgradeComponent': {
      const detailsSlim: Partial<
        Pick<ItemDetailsUpgradeComponent, 'flags' | 'infusion_upgrade_flags'>
      > &
        ItemDetailsUpgradeComponentSlim = { ...item.details };

      delete detailsSlim.flags;

      if (!detailsSlim.infusion_upgrade_flags?.length) {
        delete detailsSlim.infusion_upgrade_flags;
      }

      return detailsSlim;
    }

    case 'Weapon': {
      const detailsSlim: Partial<Pick<ItemDetailsWeapon, 'damage_type' | 'attribute_adjustment'>> &
        ItemDetailsWeaponSlim = { ...item.details };

      delete detailsSlim.damage_type;
      delete detailsSlim.attribute_adjustment;

      if (!detailsSlim.infusion_slots?.length) {
        delete detailsSlim.infusion_slots;
      }

      if (!detailsSlim.secondary_suffix_item_id) {
        delete detailsSlim.secondary_suffix_item_id;
      }

      return detailsSlim;
    }

    default:
      return item.details;
  }
}

function transformItemstats(itemstats: Itemstat[]): ItemstatSlim[] {
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
