import type {
  Account,
  AccountBank,
  AccountInventory,
  AccountMaterial,
  CharacterCore,
  CharacterEquipment,
  CharacterEquipmenttabs,
  CharacterInventoryBags,
  Item,
  Itemstat,
  Tokeninfo,
} from './types';

export interface ApiResult<T> {
  success: boolean;
  data: T;
  message: string;
}

type Fetch = typeof fetch;

export class Gw2Api {
  constructor(private apiKey: string, private fetch: Fetch) {}

  async get<T>(endpoint: string, anonymous = false): Promise<ApiResult<T>> {
    const url = `https://api.guildwars2.com/${endpoint}`;

    const opts: RequestInit = {};
    if (!anonymous) {
      opts.headers = {
        Authorization: `Bearer ${this.apiKey}`,
      };
    }

    const res = await this.fetch(url, opts);

    let success = false;
    let message = '';

    let data: unknown;
    let dataText = '';

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      data = await res.json();

      if (data && typeof data === 'object' && 'text' in data && typeof data.text === 'string') {
        dataText = data.text;
      }
    } else {
      dataText = await res.text();
    }

    if (res.ok) {
      success = true;
    } else if (res.status === 401 || res.status === 400) {
      // 401 is returned if the API key is not present or in the wrong format
      // 400 is returned it the API key is invalid
      // 400 is also returned if other request parameters are invalid

      if (dataText === 'invalid key') {
        message = 'Invalid API key'; // nicer message
      } else {
        message = dataText;
      }
    } else {
      // fallback message with more error details

      message = `${res.status}: ${res.statusText}, ${dataText}`;
    }

    return {
      success,
      data: data as T,
      message,
    };
  }

  async tokeninfo(): Promise<ApiResult<Tokeninfo>> {
    return this.get<Tokeninfo>('v2/tokeninfo');
  }

  async account(): Promise<ApiResult<Account>> {
    return this.get<Account>('v2/account');
  }

  async accountInventory(): Promise<ApiResult<AccountInventory>> {
    return this.get<AccountInventory>('v2/account/inventory');
  }

  async accountBank(): Promise<ApiResult<AccountBank>> {
    return this.get<AccountBank>('v2/account/bank');
  }

  async accountMaterials(): Promise<ApiResult<AccountMaterial[]>> {
    return this.get<AccountMaterial[]>('v2/account/materials');
  }

  async characterNames(): Promise<ApiResult<string[]>> {
    return this.get<string[]>('v2/characters');
  }

  async characterCore(characterName: string): Promise<ApiResult<CharacterCore>> {
    return this.get<CharacterCore>(`v2/characters/${characterName}/core`);
  }

  async characterInventory(characterName: string): Promise<ApiResult<CharacterInventoryBags>> {
    return this.get<CharacterInventoryBags>(`v2/characters/${characterName}/inventory`);
  }

  async characterEquipment(characterName: string): Promise<ApiResult<CharacterEquipment>> {
    return this.get<CharacterEquipment>(`v2/characters/${characterName}/equipment`);
  }

  async characterEquipmenttabs(characterName: string): Promise<ApiResult<CharacterEquipmenttabs>> {
    return this.get<CharacterEquipmenttabs>(
      `v2/characters/${characterName}/equipmenttabs?tabs=all`
    );
  }

  async items(itemIds: number[]): Promise<ApiResult<Item[]>> {
    if (itemIds.length > 200) {
      console.warn('Gw2Api.items: API only supports 200 items at a time');
    }

    return this.get<Item[]>('v2/items?ids=' + itemIds.join(','), true);
  }

  async itemstats(itemIds: number[]): Promise<ApiResult<Itemstat[]>> {
    if (itemIds.length > 200) {
      console.warn('Gw2Api.itemstats: API only supports 200 items at a time');
    }

    return this.get<Itemstat[]>('v2/itemstats?ids=' + itemIds.join(','), true);
  }
}

export async function makeGw2Api(request: Request, fetch: Fetch): Promise<Gw2Api> {
  const { apiKey } = await request.json();

  return new Gw2Api(apiKey, fetch);
}
