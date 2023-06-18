<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Loader2, RotateCcw } from 'lucide-svelte';
  import { relativeTime } from 'svelte-relative-time';
  import { apiDataMeta, apiKeyValid, initApiData, validateApiKey } from '$lib/store';
  import { Button } from '$components/ui/button';
  import H2 from '$components/H2.svelte';
  import { formatDate } from '$lib/utils';

  let pending = false;

  onMount(async () => {
    if (await validateApiKey()) {
      pending = true;
      try {
        await initApiData();
      } finally {
        pending = false;
      }
    }
  });

  async function refreshData() {
    pending = true;
    try {
      await initApiData({ forceRefresh: true });
    } finally {
      pending = false;
    }
  }
</script>

<div class="flex flex-col gap-4">
  <H2 class="sr-only">Intro</H2>

  <section>
    Find gear and other items anywhere on your
    <a href="https://www.guildwars2.com" target="_blank" class="link">Guild Wars 2</a>
    account. It will search your bank, inventory and equipment tabs (even inactive ones!) on all your
    characters. This can come in handy if you are looking for your account bound
    <span class="text-ascended">ascended</span> gear or unlimited gathering tools.
  </section>

  <section>
    But doesn't <a href="https://gw2efficiency.com" target="_blank" class="link">gw2efficiency</a> already
    do all this and more? Yes, it's a great tool and you should definitely check it out. You can look
    at all of your stuff there and search for it by name or use filters to find things. The idea here
    is to give you a set of predefined filters to make finding stuff even easier. Give it a try!
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

  {#key $apiDataMeta}
    <section in:fade|local>
      {#if $apiDataMeta}
        Data for account
        <strong>{$apiDataMeta.accountName}</strong> from
        <span>{formatDate($apiDataMeta.fetchedAt)}</span>
        <span class="text-muted-foreground">
          (<span use:relativeTime={{ date: $apiDataMeta.fetchedAt }} />)
        </span>
      {:else}
        No data yet
      {/if}
    </section>
  {/key}

  <section>
    <Button on:click={refreshData} disabled={!$apiKeyValid || pending} size="sm">
      {#if pending}
        <Loader2 class="mr-2 h-5 w-5 animate-spin" />
      {:else}
        <RotateCcw class="mr-2 h-5 w-5" />
      {/if}
      Refresh Data
    </Button>
  </section>

  <section class="mt-2">
    <H2 class="mb-2">Stuff</H2>

    <ul class="ml-4 list-disc">
      <li><span class="text-ascended">Ascended</span> gear</li>
      <li><span class="text-exotic">Exotic</span> gear</li>
      <li>
        <a href="/gathering" class="link">(Infinite) Gathering tools</a>
      </li>
      <li>
        <a href="/salvage-kits" class="link">Salvage kits</a>
      </li>
      <li>Portal scrolls</li>
      <li>Living world map currency for <span class="text-ascended">ascended</span> trinkets</li>
    </ul>
  </section>
</div>
