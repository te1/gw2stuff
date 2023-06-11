<script lang="ts">
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import { Loader2, Save, X } from 'lucide-svelte';
  import { Button } from '$components/ui/button';
  import { Input } from '$components/ui/input';
  import { Label } from '$components/ui/label';
  import { apiKey, apiKeyValid } from '$lib/store';

  export let data;

  let formRef: HTMLFormElement;

  let apiKeyStatus: { valid: boolean; message: string } | null = null;

  const { form, enhance, errors, submitting, delayed } = superForm(data.form, {
    onResult({ result }) {
      // keep additional response data from form submission

      if (result.type === 'success') {
        apiKeyStatus = {
          valid: result.data?.valid ?? false,
          message: result.data?.message ?? '',
        };

        $apiKeyValid = apiKeyStatus.valid;
      }
    },
    onUpdated({ form }) {
      // remember API key in local storage

      if (form.valid) {
        $apiKey = form.data.apiKey;
      }
    },
  });

  // restore API key from local storage
  if ($apiKey) {
    $form.apiKey = $apiKey;
  }

  onMount(async () => {
    if ($form.apiKey) {
      formRef.requestSubmit();
    }
  });

  function clearApiKey() {
    // overwrite local storage
    $apiKey = '';

    // set valid to false
    apiKeyStatus = {
      valid: false,
      message: '',
    };

    $apiKeyValid = false;
  }
</script>

<form method="POST" autocomplete="off" use:enhance bind:this={formRef}>
  <div class="mb-4 grid w-full max-w-xl items-center gap-2">
    <Label for="apiKey">API Key</Label>

    <Input
      type="text"
      id="apiKey"
      name="apiKey"
      data-invalid={$errors.apiKey}
      bind:value={$form.apiKey}
      placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
      maxlength="72"
    />

    <span class={$errors.apiKey || !apiKeyStatus?.valid ? 'text-error' : 'text-success'}>
      {#if $submitting}
        &nbsp;
      {:else if $errors.apiKey}
        {$errors.apiKey}
      {:else if apiKeyStatus?.valid}
        API key is valid
      {:else if apiKeyStatus?.message}
        {apiKeyStatus?.message}
      {:else}
        &nbsp;
      {/if}
    </span>
  </div>

  <div class="space-x-1">
    <Button type="submit" size="sm" disabled={$submitting}>
      {#if $delayed}
        <Loader2 class="mr-2 h-5 w-5 animate-spin" />
      {:else}
        <Save class="mr-2 h-5 w-5" />
      {/if}
      Save
    </Button>

    <Button type="reset" size="sm" variant="secondary" on:click={clearApiKey}>
      <X class="mr-2 h-5 w-5" />
      Clear
    </Button>
  </div>
</form>

<ol class="ml-4 mt-8 list-decimal">
  <li>
    Go to the official
    <a href="https://account.arena.net/applications" target="_blank" class="link">
      Guild Wars 2 API Key Management
    </a> page. Login if you are not already logged in.
  </li>

  <li>Click on "New Key".</li>

  <li>
    Enter any name (like "stuff") and check the
    <strong>"inventories" and "characters" permissions</strong>
    and then click "Create API Key".
  </li>

  <li>
    Copy your new API key with the "Copy" button or using <kbd>CTRL + C</kbd> on your keyboard.
  </li>

  <li>
    Paste the API key in the form above (<kbd>CTRL + V</kbd>).
  </li>

  <li>Click "Save" and you are good to go.</li>
</ol>

<aside class="mt-4">
  <strong>Note:</strong>
  <span>
    Your API key is stored locally on your device. We never store your API key on any server, but we
    pass it through to the official
    <a href="https://wiki.guildwars2.com/wiki/API:Main" target="_blank" class="link">
      Guild Wars 2 API
    </a>
    to get information about items and characters on your account. This access is read only, meaning
    your Guild Wars 2 account, characters and items can't be modified in any way. See
    <a href="https://wiki.guildwars2.com/wiki/API:API_key" target="_blank" class="link">the Wiki</a>
    for more information on API keys. We <strong>don't</strong> capture, collect or store any data related
    to you, your account, characters or items.
  </span>
</aside>
