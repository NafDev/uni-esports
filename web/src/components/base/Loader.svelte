<script lang="ts">
  import './loader.css';
  export let visible: boolean = true;
</script>

<span class="loader" style="opacity: {visible ? 100 : 0};" />
