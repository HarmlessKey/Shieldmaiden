<template>
	<i :class="icon" class="hk-icon" aria-hidden="true" />
</template>

<script>
export default {
	name: "hk-icon",
	props: {
		icon: {
			type: String,
		},
	},
};
</script>
