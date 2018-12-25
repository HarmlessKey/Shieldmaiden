<template>
	<div>
		<!-- {{ slide }} -->
		<Roll v-if="slide.type == 'roll'"/>
		<NPC v-if="slide.type == 'npc'" :npc="slide.npc" />
		<EditNpc v-if="slide.type == 'editNpc'" :npc="slide.npc" :npcKey="slide.key" />
		<Conditions v-if="slide.type == 'conditions'" :entity="slide.entity" />
	</div>
</template>

<script>
	import Roll from '@/components/slides/Roll.vue';
	import NPC from '@/components/slides/NPC.vue';
	import EditNpc from '@/components/slides/EditNpc.vue';
	import Conditions from '@/components/slides/Conditions.vue';

	export default {
		components: {
			Roll: Roll,
			NPC: NPC,
			EditNpc: EditNpc,
			Conditions: Conditions,
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