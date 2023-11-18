<template>
	<div>
		<h2 class="red">Drawer not found</h2>
		<p>We might have failed a perception check, cause this drawer can not be found...</p>

		<small class="neutral-3">
			You tried to access: {{ type }}<br />
			With the data: <br />
			{{ data }}
		</small>
	</div>
</template>

<script>
export default {
	name: "Error",
	props: ["type", "data"],
};
</script>

<style lang="scss" scoped>
small {
	word-wrap: break-word;
}
</style>
