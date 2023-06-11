<script type="ts">
  import { onMount } from 'svelte';
  import { apiKeyValid, updateValidateApiKey } from '$lib/store';

  onMount(() => {
    updateValidateApiKey();
  });
</script>

<section class="mb-4">
  <p>
    Find gear and other items anywhere on your
    <a href="https://www.guildwars2.com" target="_blank">Guild Wars 2</a>
    account. It will search your bank, inventory and equipment tabs (even inactive ones!) on all your
    characters. This can come in handy if you are looking for your account bound
    <span class="text-ascended">ascended</span> gear or unlimited gathering tools.
  </p>
</section>

{#if $apiKeyValid == null}
  <p>Checking API key...</p>
{:else if $apiKeyValid}
  <p>Your API key is valid. You can go find your stuff now.</p>
{:else}
  <p>
    You need to <a href="/settings" class="link">setup an API key</a> before you can use this tool.
  </p>
{/if}
