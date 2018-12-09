<template>
	<div>
		<!-- {{ slide }} -->
		<Roll v-if="slide.type == 'roll'"/>
	</div>
</template>

<script>
	import Roll from '@/components/slides/Roll.vue';

	export default {
		components: {
			Roll: Roll
		},
		data() {
			return {
				slide: this.$store.getters.getSlide,
			}
		},
		methods: {
			
		}
	};
</script>

<style lang="scss" scoped>
	.slide-wrap {
		padding: 10px;
	}
</style>