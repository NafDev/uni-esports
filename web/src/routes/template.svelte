<script lang="ts">
  import Button from '@/components/base/Button.svelte';
  import Card from '@/components/base/Card.svelte';
  import FloatingField from '@/components/base/FloatingField.svelte';
  import { testStore } from '@/lib/stores/test.store';

  let loading = false;
</script>

<Button type="primary" label="Hello" {loading} on:click={() => (loading = !loading)} />
<Button type="danger" label="Delete" {loading} on:click={() => (loading = !loading)} />
<Button type="secondary" label="jeff" {loading} on:click={() => (loading = !loading)} />
<Card>
  <FloatingField label="A Field" name="myField" type="text" bind:value={$testStore} />
  <Button type="primary" label="Submit" />
</Card>
