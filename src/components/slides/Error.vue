<template>
	<div>
		<h2 class="red">Slide not found</h2>
		<p>We might have failed a perception check, cause this slide can not be found...</p>

		<small class="neutral-3">
			You tried to acces: {{ type }}<br/>
			With the data: <br/>
			{{ data }}
		</small>
	</div>
</template>

<script>
	export default {
		name: 'Error',
		props: ['type', 'data']
	};
</script>

<style lang="scss" scoped>
	small {
		word-wrap: break-word;
	}
</style>