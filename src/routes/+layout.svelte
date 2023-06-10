<script>
  import { browser, dev } from '$app/environment';
  import { page } from '$app/stores';
  import { inject } from '@vercel/analytics';
  import { webVitals } from '$lib/webVitals';
  import { setInitialClassState } from '$components/lightSwitch';

  import '../app.postcss';
  import AppHeader from '$components/AppHeader.svelte';
  import AppFooter from '$components/AppFooter.svelte';

  const analyticsId = import.meta.env.VERCEL_ANALYTICS_ID;

  $: if (browser && analyticsId) {
    webVitals({
      path: $page.url.pathname,
      params: $page.params,
      analyticsId,
      debug: false,
    });
  }

  inject({ mode: dev ? 'development' : 'production' });
</script>

<svelte:head>
  {@html `<\u{73}cript nonce="%sveltekit.nonce%">(${setInitialClassState.toString()})();</script>`}
</svelte:head>

<div class="container">
  <AppHeader />
  <slot />
  <AppFooter />
</div>
