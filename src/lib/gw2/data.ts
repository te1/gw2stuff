import type { CharacterProfession, CharacterRace, ItemType } from './types';
import type { ItemSlim, ItemstatSlim } from './typesSlim';
import type { DataSlim } from './transform';

export interface CharacterInfo {
  name: string;
  race: CharacterRace;
  profession: CharacterProfession;
  level: number;
}

export class ItemLocations {
  account = new AccountItems();
  characters: CharacterItems[] = [];
}

export class AccountItems {
  inventory: ItemSlot[] = [];
  bank: ItemSlot[] = [];
  materials: ItemSlot[] = [];
}

export class CharacterItems {
  inventory: ItemSlot[] = [];
  equipmenttabs: Equipmenttab[] = [];

  constructor(public characterName: string) {}

  isEmpty() {
    return !this.inventory.length && this.equipmenttabs.every((tab) => tab.isEmpty());
  }
}

export class Equipmenttab {
  equipment: ItemSlot[] = [];

  constructor(public tab: number, public name: string, public active: boolean) {}

  isEmpty() {
    return !this.equipment.length;
  }
}

export class ItemSlot {
  constructor(public itemId: number, public count: number, public itemData: ItemSlim) {}
}

export const characterInfo = new Map<string, CharacterInfo>();
export const itemData = new Map<number, ItemSlim>();
export const itemstatData = new Map<number, ItemstatSlim>();

let initDone = false;

export function init(apiData: DataSlim) {
  // create lookup maps

  characterInfo.clear();
  for (const character of apiData.characters) {
    characterInfo.set(character.name, {
      name: character.name,
      race: character.race,
      profession: character.profession,
      level: character.level,
    });
  }

  itemData.clear();
  for (const item of apiData.items) {
    itemData.set(item.id, item);
  }

  itemstatData.clear();
  for (const itemstat of apiData.itemstats) {
    itemstatData.set(itemstat.id, itemstat);
  }

  initDone = true;
}

export function ensureInit(apiData: DataSlim) {
  if (!initDone) {
    init(apiData);
  }
}

export function getCharacterInfo(characterName: string): CharacterInfo | undefined {
  return characterInfo.get(characterName);
}

export function getItemData(itemId: number): ItemSlim | undefined {
  return itemData.get(itemId);
}

export function getItemstatData(itemstatId: number): ItemstatSlim | undefined {
  return itemstatData.get(itemstatId);
}

function getItems(
  apiData: DataSlim,
  itemType: ItemType,
  { includeMaterials = true } = {}
): ItemLocations {
  ensureInit(apiData);

  const locations = new ItemLocations();

  let itemData: ItemSlim | undefined;

  // -- account
  for (const slot of apiData.account.inventory) {
    itemData = getItemData(slot.id);

    if (itemData?.type === itemType) {
      locations.account.inventory.push(new ItemSlot(slot.id, slot.count, itemData));
    }
  }

  for (const slot of apiData.account.bank) {
    itemData = getItemData(slot.id);

    if (itemData?.type === itemType) {
      locations.account.bank.push(new ItemSlot(slot.id, slot.count, itemData));
    }
  }

  if (includeMaterials) {
    for (const material of apiData.account.materials) {
      itemData = getItemData(material.id);

      if (itemData?.type === itemType) {
        locations.account.bank.push(new ItemSlot(material.id, material.count, itemData));
      }
    }
  }

  // -- characters
  let items: CharacterItems;
  let equipmenttab: Equipmenttab;

  for (const character of apiData.characters) {
    items = new CharacterItems(character.name);

    for (const slot of character.inventory) {
      itemData = getItemData(slot.id);

      if (itemData?.type === itemType) {
        items.inventory.push(new ItemSlot(slot.id, slot.count, itemData));
      }
    }

    for (const tab of character.equipmenttabs) {
      equipmenttab = new Equipmenttab(tab.tab, tab.name, tab.is_active);

      for (const slot of tab.equipment) {
        itemData = getItemData(slot.id);

        if (itemData?.type === itemType) {
          equipmenttab.equipment.push(new ItemSlot(slot.id, slot.count, itemData));
        }
      }

      // if (!equipmenttab.isEmpty()) {
      items.equipmenttabs.push(equipmenttab);
      // }
    }

    if (!items.isEmpty()) {
      locations.characters.push(items);
    }
  }

  return locations;
}

export function getGatheringTools(apiData: DataSlim) {
  return getItems(apiData, 'Gathering', { includeMaterials: false });
}
