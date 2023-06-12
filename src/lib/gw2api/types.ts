// https://wiki.guildwars2.com/wiki/API:2/account
export interface Account {
  id: string; // The unique persistent account GUID.
  age: number; // The age of the account in seconds.
  name: string; // The unique account name with numerical suffix. It is possible that the name change. Do not rely on the name, use id instead.
  world: number; // The id of the home world the account is assigned to. Can be resolved against /v2/worlds.
  guilds: string[]; // A list of guilds assigned to the given account.
  guild_leader: string[]; // A list of guilds the account is leader of. Requires the additional guilds scope.
  created: string; // An ISO-8601 standard timestamp of when the account was created.

  // A list of what content this account has access to. Possible values:
  access: Array<
    'None' | 'PlayForFree' | 'GuildWars2' | 'HeartOfThorns' | 'PathOfFire' | 'EndOfDragons'
  >;
  // None          – should probably never happen
  // PlayForFree   – without any other flags, this identifies an account which has not yet purchased the game. (This flag does however also appear on accounts who have purchased the base game or any of the expansions).
  // GuildWars2    – has purchased the base game
  // HeartOfThorns – has purchased Heart of Thorns, accounts that recieve Heart of Thorns by purchasing Path of Fire will not have this flag set.
  // PathOfFire    – has purchased Path of Fire, this flag also implies that the account has access to Heart of Thorns.
  // EndOfDragons  - has purchased End of Dragons

  commander: boolean; // True if the player has bought a commander tag.
  fractal_level: number; // The account's personal fractal reward level. Requires the additional progression scope.
  daily_ap: number; // The daily AP the account has. Requires the additional progression scope.
  monthly_ap: number; // The monthly AP the account has. Requires the additional progression scope.
  wvw_rank: number; // The account's personal wvw rank. Requires the additional progression scope.
  last_modified: string; // An ISO-8601 standard timestamp of when the account information last changed as perceived by the API. This field is only present when a Schema version of 2019-02-21T00:00:00Z or later is requested.
  build_storage_slots: number; // The amount of build storage slot an account has unlocked. Requires the additional builds scope. This field is only present when a Schema version of 2019-12-19T00:00:00.000Z or later is requested.
}

export type Slots = Array<Slot | null>;

export interface Slot {
  id: number; // The item's ID.
  count: number; // The amount of items in the item stack.
  charges?: number; // The amount of charges remaining on the item.
  skin?: number; // The skin applied to the item, if it is different from its original. Can be resolved against /v2/skins.
  upgrades?: number[]; // An array of item IDs for each rune or sigil applied to the item.
  infusions?: number[]; // An array of item IDs for each infusion applied to the item.
}

// https://wiki.guildwars2.com/wiki/API:2/account/inventory
export type AccountInventory = Array<AccountInventorySlot | null>;

export interface AccountInventorySlot extends Slot {
  binding?: 'Account'; // The current binding of the item. If present, the only possible value is Account.
}

// https://wiki.guildwars2.com/wiki/API:2/account/bank
export type AccountBank = Array<AccountBankSlot | null>;

export interface AccountBankSlot extends Slot {
  dyes?: number[]; // The IDs of the dyes applied to the item. Can be resolved against /v2/colors.
  upgrade_slot_indices?: number[]; // The slot occupied by the upgrade at the corresponding position in upgrades.
  binding?: 'Account' | 'Character'; // The current binding of the item. Either Account or Character if present.
  bound_to?: string; // If binding is Character, this field tells which character it is bound to.
  stats?: ItemStats; // The stats of the item.
}

// https://wiki.guildwars2.com/wiki/API:2/characters/:id/inventory
export interface CharacterInventoryBags {
  bags: CharacterInventoryBag[]; // Contains one object structure per bag in the character's inventory
}

export interface CharacterInventoryBag {
  id: number; // The bag's item id which can be resolved against /v2/items
  size: number; // The amount of slots available with this bag.
  inventory: CharacterInventory; // Contains one object structure per item, object is null if no item is in the given bag slot.
}

export type CharacterInventory = Array<CharacterInventorySlot | null>;

export interface CharacterInventorySlot extends Slot {
  stats?: ItemStats; // The stats of the item.
  dyes?: number[]; // Array of selected dyes for the equipment piece. Values default to null if no dye is selected. Colors can be resolved against v2/colors
  binding?: 'Character' | 'Account'; // describes which kind of binding the item has. Possible values: Character, Account
  bound_to?: string; // only if character bound, Name of the character the item is bound to.
}

// https://wiki.guildwars2.com/wiki/API:2/characters/:id/equipmenttabs
export type CharacterEquipmentTabs = CharacterEquipmentTab[];

export interface CharacterEquipmentTab {
  tab: number; // The "id" of this tab. (The position at which it resides.)
  name: string; // The name given to the equipment combination.
  is_active: boolean; // Whether or not this is the tab selected on the character currently.
  equipment: CharacterEquipmentSlot[]; // Contains an object for each equiped piece of equipment.

  // Contains the following key-value pairs:
  equipment_pvp: {
    amulet: number; // resolve id against v2/pvp/amulets.
    rune: number; // resolve id against v2/items.
    sigils: number[]; // resolve ids against v2/items. Will contain nulls for unequipped items.
    // Sigils are provided in the order [<primary weapon sigil 1>, <secondary weapon sigil 1>, <primary weapon sigil 2>, <secondary weapon sigil 2>].
  };
}

export interface CharacterEquipmentSlot extends Slot {
  // In which slot the equipment piece is equiped. Possible values
  slot:
    | 'Helm'
    | 'Shoulders'
    | 'Coat'
    | 'Gloves'
    | 'Leggings'
    | 'Boots'
    | 'WeaponA1'
    | 'WeaponA2'
    | 'WeaponB1'
    | 'WeaponB2'
    | 'Backpack'
    | 'Accessory1'
    | 'Accessory2'
    | 'Amulet'
    | 'Ring1'
    | 'Ring2'
    | 'HelmAquatic'
    | 'WeaponAquaticA'
    | 'WeaponAquaticB ';

  binding?: 'Account' | 'Character'; // The binding of the item. Possible values: Account, Character
  bound_to?: string; // The name of the character to which the item is bound.
  location: 'Equipped' | 'Armory'; // Either Equipped or Armory.
  dyes?: number[]; // Four dye ids representing the dyes used in the dye slots of the equipment piece or null if a dye slot is unavailable for a piece. Resolvable against /v2/colors.
  stats?: ItemStats; // Contains detailed information on the item stats.
}

// https://wiki.guildwars2.com/wiki/API:2/items
export interface Item {
  id: number; // The item id.
  chat_link: string; // The chat link.
  name: string; // The item name.
  icon?: string; // The full icon URL.
  description?: string; // The item description.

  // The item type (see below). Possible value
  type:
    | 'Armor' // Armor
    | 'Back' // Back item
    | 'Bag' // Bags
    | 'Consumable' // Consumables
    | 'Container' // Containers
    | 'CraftingMaterial' // Crafting materials
    | 'Gathering' // Gathering tools, baits and lures
    | 'Gizmo' // Gizmos
    | 'JadeTechModule' // Sensory Array and Service Chip modules
    | 'Key'
    | 'MiniPet' // Miniatures
    | 'PowerCore' // Power Cores
    | 'Tool' // Salvage kits
    | 'Trait' // Trait guides
    | 'Trinket' // Trinkets
    | 'Trophy' // Trophies
    | 'UpgradeComponent' // Upgrade components
    | 'Weapon'; // Weapons

  // The item rarity. Possible values
  rarity: 'Junk' | 'Basic' | 'Fine' | 'Masterwork' | 'Rare' | 'Exotic' | 'Ascended' | 'Legendary';

  level: number; // The required level.
  vendor_value: number; // The value in coins when selling to a vendor. (Can be non-zero even when the item has the NoSell flag.)
  default_skin?: number; // The default skin id.

  // Flags applying to the item. Possible values:
  flags: Array<
    | 'AccountBindOnUse' // Account bound on use
    | 'AccountBound' // Account bound on acquire
    | 'Attuned' // If the item is attuned
    | 'BulkConsume' // If the item can be bulk consumed
    | 'DeleteWarning' // If the item will prompt the player with a warning when deleting
    | 'HideSuffix' // Hide the suffix of the upgrade component
    | 'Infused' // If the item is infused
    | 'MonsterOnly'
    | 'NoMysticForge' // Not usable in the Mystic Forge
    | 'NoSalvage' // Not salvageable
    | 'NoSell' // Not sellable
    | 'NotUpgradeable' // Not upgradeable
    | 'NoUnderwater' // Not available underwater
    | 'SoulbindOnAcquire' // Soulbound on acquire
    | 'SoulBindOnUse' // Soulbound on use
    | 'Tonic' // If the item is a tonic
    | 'Unique' // Unique
  >;

  // The game types in which the item is usable. At least one game type is specified. Possible values
  game_types: Array<
    | 'Activity' // Usable in activities
    | 'Dungeon' // Usable in dungeons
    | 'Pve' // Usable in general PvE
    | 'Pvp' // Usable in PvP
    | 'PvpLobby' // Usable in the Heart of the Mists
    | 'Wvw' // Usable in World vs. World
  >;

  // Restrictions applied to the item. Possible values:
  restrictions: Array<
    | 'Asura'
    | 'Charr'
    | 'Female'
    | 'Human'
    | 'Norn'
    | 'Sylvari'
    | 'Elementalist'
    | 'Engineer'
    | 'Guardian'
    | 'Mesmer'
    | 'Necromancer'
    | 'Ranger'
    | 'Thief'
    | 'Warrior'
  >;

  // Lists what items this item can be upgraded into, and the method of upgrading. Each object in the array has the following attributes
  upgrades_into?: ItemUpgrade[];

  // Lists what items this item can be upgraded from, and the method of upgrading. See upgrades_into for format.
  upgrades_from?: ItemUpgrade[];

  details?: object; // Additional item details if applicable, depending on the item type (see below).
}

export interface ItemUpgrade {
  // Describes the method of upgrading. Possible values:
  upgrade: 'Attunement' | 'Infusion';

  item_id: number; // The item ID that results from performing the upgrade.
}

export interface ItemStats {
  id: number; // The ID of the item's stats. Can be resolved against /v2/itemstats.

  // The stats provided by this item.
  attributes?: {
    AgonyResistance?: number; // Agony Resistance
    BoonDuration?: number; // Concentration
    ConditionDamage?: number; // Condition Damage
    ConditionDuration?: number; // Expertise
    CritDamage?: number; // Ferocity
    Healing?: number; // Healing Power
    Power?: number; // Power
    Precision?: number; // Precision
    Toughness?: number; // Toughness
    Vitality?: number; // Vitality
  };
}
