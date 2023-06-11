<script lang="ts">
  import { Icons } from '$components/icons';
  import Button from './ui/button/Button.svelte';

  const links = [
    { href: '/', text: 'Home' },
    { href: '/settings', text: 'Settings' },
  ];
</script>

<footer class="mt-8 flex items-center justify-between border-t border-primary py-4">
  <nav class="leading-none">
    <ul class="flex divide-x divide-primary">
      {#each links as link}
        <li class="px-2 first:pl-0 last:pr-0">
          <a href={link.href} class="link">
            {link.text}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <Button
    href="https://github.com/te1/gw2stuff"
    target="_blank"
    variant="ghost"
    size="sm"
    class="w-9 px-0"
    title="Source Code On GitHub"
  >
    <Icons.gitHub class="h-5 w-5" />
    <span class="sr-only">Source Code On GitHub</span>
  </Button>
</footer>
