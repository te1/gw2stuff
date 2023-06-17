import type { DataSlim } from './transform';
import type { ItemSlim, ItemstatSlim } from './typesSlim';

export const itemData = new Map<number, ItemSlim>();
export const itemstatData = new Map<number, ItemstatSlim>();

export function init(data: DataSlim) {
  // create lookup maps

  itemData.clear();
  for (const item of data.items) {
    itemData.set(item.id, item);
  }

  itemstatData.clear();
  for (const itemstat of data.itemstats) {
    itemstatData.set(itemstat.id, itemstat);
  }
}

export function getItemData(itemId: number): ItemSlim | undefined {
  return itemData.get(itemId);
}

export function getItemstatData(itemstatId: number): ItemstatSlim | undefined {
  return itemstatData.get(itemstatId);
}
