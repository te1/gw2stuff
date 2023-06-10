<script>
  import { browser, dev } from '$app/environment';
  import { page } from '$app/stores';
  import { inject } from '@vercel/analytics';
  import { webVitals } from '$lib/vitals';

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

  inject({ mode: dev ? 'development' : 'production' });
</script>

<slot />
