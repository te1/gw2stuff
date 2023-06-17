// "Slim" versions that omit certain props

import type {
  AccountBankSlot,
  AccountMaterial,
  CharacterEquipmentSlot,
  CharacterEquipmenttab,
  CharacterInventorySlot,
  Item,
  ItemDetailsArmor,
  ItemDetailsBack,
  ItemDetailsBag,
  ItemDetailsConsumable,
  ItemDetailsContainer,
  ItemDetailsGathering,
  ItemDetailsGizmo,
  ItemDetailsMiniature,
  ItemDetailsSalvageKit,
  ItemDetailsTrinket,
  ItemDetailsUpgradeComponent,
  ItemDetailsWeapon,
  ItemInfusionSlot,
  ItemInfusionUpgradeFlag,
  ItemRestriction,
  Itemstat,
  ItemstatAttribute,
} from './types';

export type AccountBankSlotSlim = Omit<AccountBankSlot, 'dyes'>;
export type AccountMaterialSlim = Omit<AccountMaterial, 'category'>;
export type CharacterInventorySlotSlim = Omit<CharacterInventorySlot, 'dyes'>;
export type CharacterEquipmentSlotSlim = Omit<CharacterEquipmentSlot, 'dyes'>;
export type ItemstatAttributeSlim = Omit<ItemstatAttribute, 'value'>;

export interface CharacterEquipmenttabSlim extends Omit<CharacterEquipmenttab, 'equipment_pvp'> {
  equipment: CharacterEquipmentSlotSlim[];
}

export interface ItemSlim
  extends Omit<
    Item,
    | 'chat_link'
    | 'game_types'
    | 'flags'
    | 'vendor_value'
    | 'description'
    | 'upgrades_from'
    | 'upgrades_into'
    | 'restrictions'
    | 'details'
  > {
  restrictions?: Array<ItemRestriction>;

  details?: ItemDetailsSlim;
}

export type ItemDetailsSlim =
  | ItemDetailsArmorSlim
  | ItemDetailsBackSlim
  | ItemDetailsBagSlim
  | ItemDetailsConsumableSlim
  | ItemDetailsContainer
  | ItemDetailsGathering
  | ItemDetailsGizmoSlim
  | ItemDetailsMiniature
  | ItemDetailsSalvageKitSlim
  | ItemDetailsTrinketSlim
  | ItemDetailsUpgradeComponentSlim
  | ItemDetailsWeaponSlim;

export interface ItemDetailsArmorSlim
  extends Omit<
    ItemDetailsArmor,
    'attribute_adjustment' | 'infusion_slots' | 'secondary_suffix_item_id'
  > {
  infusion_slots?: ItemInfusionSlot[];
  secondary_suffix_item_id?: string;
}

export interface ItemDetailsBackSlim
  extends Omit<
    ItemDetailsBack,
    'attribute_adjustment' | 'infusion_slots' | 'secondary_suffix_item_id'
  > {
  infusion_slots?: ItemInfusionSlot[];
  secondary_suffix_item_id?: string;
}

export type ItemDetailsBagSlim = Omit<ItemDetailsBag, 'no_sell_or_sort'>;

export type ItemDetailsConsumableSlim = Omit<
  ItemDetailsConsumable,
  | 'description'
  | 'duration_ms'
  | 'color_id'
  | 'recipe_id'
  | 'extra_recipe_ids'
  | 'guild_upgrade_id'
  | 'apply_count'
  | 'skins'
>;

export type ItemDetailsGizmoSlim = Omit<ItemDetailsGizmo, 'guild_upgrade_id' | 'vendor_ids'>;

export type ItemDetailsSalvageKitSlim = Omit<ItemDetailsSalvageKit, 'type'>;

export interface ItemDetailsTrinketSlim
  extends Omit<
    ItemDetailsTrinket,
    'attribute_adjustment' | 'infusion_slots' | 'secondary_suffix_item_id'
  > {
  infusion_slots?: ItemInfusionSlot[];
  secondary_suffix_item_id?: string;
}

export interface ItemDetailsUpgradeComponentSlim
  extends Omit<ItemDetailsUpgradeComponent, 'flags' | 'infusion_upgrade_flags'> {
  infusion_upgrade_flags?: Array<ItemInfusionUpgradeFlag>;
}

export interface ItemDetailsWeaponSlim
  extends Omit<
    ItemDetailsWeapon,
    'damage_type' | 'attribute_adjustment' | 'infusion_slots' | 'secondary_suffix_item_id'
  > {
  infusion_slots?: ItemInfusionSlot[];
  secondary_suffix_item_id?: string;
}

export interface ItemstatSlim extends Omit<Itemstat, 'attributes'> {
  attributes: ItemstatAttributeSlim[];
}
