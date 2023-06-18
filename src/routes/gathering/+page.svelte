<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiData } from '$lib/store';
  import { ItemLocations, getGatheringTools } from '$lib/gw2/data';
  import { init } from 'svelte/internal';

  let data: ItemLocations;

  onMount(() => {
    if (!$apiData) {
      return goto('/');
    }

    data = getGatheringTools($apiData);

    console.log(data);
  });
</script>
