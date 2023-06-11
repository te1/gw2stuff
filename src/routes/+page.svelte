<script type="ts">
  import { apiKeyValid } from '$lib/store';
</script>

<p class="mb-4">
  Find gear and other items anywhere on your
  <a href="https://www.guildwars2.com" target="_blank">Guild Wars 2</a>
  account. It will search your bank, inventory and equipment tabs (even inactive ones!) on all your characters.
  This can come in handy if you are looking for your account bound
  <span class="text-ascended">ascended</span> gear or unlimited gathering tools.
</p>

{#if $apiKeyValid}
  <p>Your API key is valid. You can go find your stuff now.</p>
{:else}
  <p>
    You need to <a href="/settings" class="link">setup an API key</a> before you can use this tool.
  </p>
{/if}
