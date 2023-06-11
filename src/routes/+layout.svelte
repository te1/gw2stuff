<script>
  import { inject } from '@vercel/analytics';
  import { browser, dev } from '$app/environment';
  import { page } from '$app/stores';
  import { webVitals } from '$lib/webVitals';
  import { setInitialClassState } from '$components/lightSwitch';
  import AppHeader from '$components/AppHeader.svelte';
  import AppFooter from '$components/AppFooter.svelte';
  import '../app.postcss';

  const analyticsId = import.meta.env.VERCEL_ANALYTICS_ID;

  $: if (browser && analyticsId) {
    webVitals({
      path: $page.url.pathname,
      params: $page.params,
      analyticsId,
      debug: false,
    });
  }

  if (!dev) {
    inject({ mode: dev ? 'development' : 'production' });
  }
</script>

<svelte:head>
  <title>Where Is My Stuff? Find Items On Your Guild Wars 2 Account!</title>
  <meta
    name="description"
    content="Find gear and items anywhere on your Guild Wars 2 account, in your bank, inventory and equipment tabs on all your characters."
  />
  <meta
    name="keywords"
    content="Guild Wars 2, Find, Item, Gear, Ascended, Account, Equipment, Bank, Inventory, Gathering"
  />
  {@html `<\u{73}cript nonce="%sveltekit.nonce%">(${setInitialClassState.toString()})();</script>`}
</svelte:head>

<div class="container">
  <AppHeader />
  <main>
    <slot />
  </main>
  <AppFooter />
</div>
