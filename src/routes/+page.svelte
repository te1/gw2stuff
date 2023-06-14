<script type="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Loader2, RotateCcw } from 'lucide-svelte';
  import { apiKey, apiKeyValid, validateApiKey } from '$lib/store';
  import { Button } from '$components/ui/button';

  let pending = false;

  onMount(() => {
    validateApiKey();
  });

  async function fetchData() {
    pending = true;

    const res = await fetch('/api/data', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: $apiKey }),
    });

    const data = await res.json();

    pending = false;

    console.log(data);
  }
</script>

<section class="mb-4">
  Find gear and other items anywhere on your
  <a href="https://www.guildwars2.com" target="_blank">Guild Wars 2</a>
  account. It will search your bank, inventory and equipment tabs (even inactive ones!) on all your characters.
  This can come in handy if you are looking for your account bound
  <span class="text-ascended">ascended</span> gear or unlimited gathering tools.
</section>

{#key $apiKeyValid}
  <section in:fade|local>
    {#if $apiKeyValid == null}
      Checking API key...
    {:else if $apiKeyValid}
      Your API key is valid. You can go find your stuff now.
    {:else}
      You need to <a href="/settings" class="link">setup an API key</a> before you can use this tool.
    {/if}
  </section>
{/key}

<section class="mt-4">
  <Button on:click={fetchData} disabled={!$apiKeyValid || pending} size="sm">
    {#if pending}
      <Loader2 class="mr-2 h-5 w-5 animate-spin" />
    {:else}
      <RotateCcw class="mr-2 h-5 w-5" />
    {/if}
    Fetch Data
  </Button>
</section>

<ul class="mt-4">
  <li>Ascended gear</li>
  <li>Exotic gear</li>
  <li>Infinite gathering tools</li>
  <li>Infinite salvage kits</li>
  <li>Portal scrolls</li>
  <li>Living world map currency for ascended trinkets</li>
</ul>
