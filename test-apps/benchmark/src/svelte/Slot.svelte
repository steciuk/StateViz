<script lang="ts">
  export let name: string;
</script>

<div>
  <h2>{name}</h2>
  <div>
    <slot />
  </div>
</div>
