<script lang="ts">
  import { persisted } from 'svelte-local-storage-store';
  import { X } from 'lucide-svelte';
  import { Button } from '$components/ui/button';
  import { Input } from '$components/ui/input';

  export const apiKey = persisted<string>('apiKey', '');
</script>

<Button><X class="mr-2 h-5 w-5" />Clear</Button>
<Input type="text" name="apiKey" bind:value={$apiKey} />

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
