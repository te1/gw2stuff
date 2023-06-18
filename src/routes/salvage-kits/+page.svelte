<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiData } from '$lib/store';
  import { ItemLocations, getSalvageKits } from '$lib/gw2/data';

  let data: ItemLocations;

  onMount(() => {
    if (!$apiData) {
      return goto('/');
    }

    data = getSalvageKits($apiData);

    console.log(data);
  });
</script>

{#if data?.account.inventory.length}
  <div>Shared Inventory</div>

  {#each data.account.inventory as slot}
    <div>
      {#if slot.count}
        {slot.count} x
      {/if}
      {slot.itemId}
      {#if slot.charges}
        ({slot.charges})
      {/if}
      {slot.itemData.name}
    </div>
  {/each}
{/if}

{#if data?.account.bank.length}
  <div>Bank</div>

  {#each data.account.bank as slot}
    <div>
      {#if slot.count}
        {slot.count} x
      {/if}
      {slot.itemId}
      {#if slot.charges}
        ({slot.charges})
      {/if}
      {slot.itemData.name}
    </div>
  {/each}
{/if}

{#if data?.account.materials.length}
  <div>Material Storage</div>

  {#each data.account.materials as slot}
    <div>
      {#if slot.count}
        {slot.count} x
      {/if}
      {slot.itemId}
      {#if slot.charges}
        ({slot.charges})
      {/if}
      {slot.itemData.name}
    </div>
  {/each}
{/if}

{#if data?.characters.length}
  {#each data.characters as character}
    <div>{character.characterName}</div>

    {#if character.equipmenttabs.length}
      {#each character.equipmenttabs as tab}
        {#if tab.equipment.length}
          <div>{tab.name}</div>

          {#each tab.equipment as slot}
            <div>
              {#if slot.count}
                {slot.count} x
              {/if}
              {slot.itemId}
              {#if slot.charges}
                ({slot.charges})
              {/if}
              {slot.itemData.name}
            </div>
          {/each}
        {/if}
      {/each}
    {/if}

    {#if character.gatheringTools.length}
      <div>Gathering Tools</div>

      {#each character.gatheringTools as slot}
        <div>
          {#if slot.count}
            {slot.count} x
          {/if}
          {slot.itemId}
          {#if slot.charges}
            ({slot.charges})
          {/if}
          {slot.itemData.name}
        </div>
      {/each}
    {/if}

    {#if character.inventory.length}
      <div>Inventory</div>

      {#each character.inventory as slot}
        <div>
          {#if slot.count}
            {slot.count} x
          {/if}
          {slot.itemId}
          {#if slot.charges}
            ({slot.charges})
          {/if}
          {slot.itemData.name}
        </div>
      {/each}
    {/if}
  {/each}
{/if}
