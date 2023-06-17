<script lang="ts">
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils';

  const labelVariants = cva('text-xl font-semibold');

  let className: string | undefined | null = undefined;
  export { className as class };
</script>

<h2 class={cn(labelVariants(), className)} {...$$restProps}>
  <slot />
</h2>
