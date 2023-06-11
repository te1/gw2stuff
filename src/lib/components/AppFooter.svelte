<script lang="ts">
  import { Icons } from '$components/icons';
  import Button from './ui/button/Button.svelte';
</script>

<footer class="mt-8 flex items-center justify-between border-t border-primary py-4">
  <span>Footer Text Placeholder</span>

  <Button
    href="https://github.com/te1/gw2stuff"
    target="_blank"
    variant="ghost"
    size="sm"
    class="w-9 px-0"
    title="Source Code On GitHub"
    ><Icons.gitHub class="h-5 w-5" />
    <span class="sr-only">Source Code On GitHub</span></Button
  >
</footer>
