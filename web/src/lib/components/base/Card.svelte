<script>
	import './base.css';

	let className = '';
	export { className as class };
</script>

<div class="card {className}">
	<slot />
</div>
