<script>
  import { browser, dev } from '$app/environment';
  import { page } from '$app/stores';
  // @ts-ignore
  import { VERCEL_ANALYTICS_ID } from '$env/static/public';
  import { inject } from '@vercel/analytics';
  import { webVitals } from '$lib/vitals';

  import '../app.postcss';

  $: if (browser && VERCEL_ANALYTICS_ID) {
    webVitals({
      path: $page.url.pathname,
      params: $page.params,
      analyticsId: VERCEL_ANALYTICS_ID,
      debug: false,
    });
  }

  inject({ mode: dev ? 'development' : 'production' });
</script>

<slot />
