<script lang="ts">
  export let onClick: () => void;
  export let disabled: boolean = false;
</script>

<button on:click={onClick} {disabled} class="button">
  <slot />
</button>
