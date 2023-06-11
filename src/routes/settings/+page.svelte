<script lang="ts">
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import { X, Save } from 'lucide-svelte';
  import { Button } from '$components/ui/button';
  import { Input } from '$components/ui/input';
  import { apiKey, apiKeyValid } from '$lib/store';

  export let data;

  let formRef: HTMLFormElement;

  let apiKeyStatus: { valid: boolean; message: string } | null = null;

  const { form, enhance, errors } = superForm(data.form, {
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

<form method="POST" use:enhance bind:this={formRef}>
  <Input type="text" name="apiKey" data-invalid={$errors.apiKey} bind:value={$form.apiKey} />

  {#if $errors.apiKey}
    <span class="invalid">{$errors.apiKey}</span>
  {/if}

  <Button type="reset" on:click={clearApiKey}><X class="mr-2 h-5 w-5" />Clear</Button>
  <Button type="submit"><Save class="mr-2 h-5 w-5" />Save</Button>
</form>

<pre>
  {JSON.stringify(apiKeyStatus, null, 2)}
</pre>

<ol class="list-decimal">
  <li>
    Open the <a href="https://account.arena.net/applications" target="_blank" class="link"
      >official Guild Wars 2 API Key Management</a
    >.
  </li>
  <li>Click on the "New Key" button.</li>
  <li>Enter a name of your choice and <strong>check all permission checkboxes</strong>.</li>
  <li>
    Copy your new API key. <kbd>CTRL + C</kbd>
  </li>
  <li>
    Paste it in the form above. <kbd>CTRL + V</kbd>
  </li>
  <li>Click the "Save new API key" button.</li>
  <li>You are set, have fun exploring your account!</li>
</ol>
