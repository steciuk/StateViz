<script>
  import Component from "./Component.svelte";
  import Eaches from "./Eaches.svelte";
  import IfElse from "./IfElse.svelte";
  import Key from "./Key.svelte";
  import RegisterComponent from "./RegisterComponent.svelte";
  import Slot from "./Slot.svelte";
</script>

<div>
  <h1>Svelte</h1>
  <Component name="Component" />
  <Eaches name="Eaches" />
  <Slot name="Slot">
    <Component name="Component in Slot" />
  </Slot>
  <IfElse name="IfElse" />
  <Key name="Key" />
  <RegisterComponent />
</div>
