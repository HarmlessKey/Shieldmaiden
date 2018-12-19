<template>
	<div>
		<!-- {{ slide }} -->
		<Roll v-if="slide.type == 'roll'"/>
		<NPC v-if="slide.type == 'npc'" :npc="slide.npc" />
	</div>
</template>

<script>
	import Roll from '@/components/slides/Roll.vue';
	import NPC from '@/components/slides/NPC.vue';

	export default {
		components: {
			Roll: Roll,
			NPC: NPC
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