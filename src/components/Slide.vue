<template>
	<div>
		<!-- {{ slide }} -->
		<Roll v-if="slide.type == 'roll'"/>
		<NPC v-if="slide.type == 'npc'" :npc="slide.npc" />
		<AddNpc v-if="slide.type == 'addNpc'" />
		<EditNpc v-if="slide.type == 'editNpc'" :npc="slide.npc" :npcKey="slide.key" />
		<Condition v-if="slide.type == 'condition'" :condition="slide.condition" />
		<Conditions v-if="slide.type == 'conditions'" :entity="slide.entity" />
		<Edit v-if="slide.type == 'edit'" :entityKey="slide.key" :entity="slide.entity" />
		<DeathSaves v-if="slide.type == 'deathSaves'" />
	</div>
</template>

<script>
	import Roll from '@/components/slides/Roll.vue';
	import NPC from '@/components/slides/NPC.vue';
	import AddNpc from '@/components/slides/AddNpc.vue';
	import EditNpc from '@/components/slides/EditNpc.vue';
	import Condition from '@/components/slides/Condition.vue';
	import Conditions from '@/components/slides/Conditions.vue';
	import Edit from '@/components/slides/Edit.vue';
	import DeathSaves from '@/components/slides/DeathSaves.vue';

	export default {
		components: {
			Roll: Roll,
			NPC: NPC,
			AddNpc: AddNpc,
			EditNpc: EditNpc,
			Condition: Condition,
			Conditions: Conditions,
			Edit: Edit,
			DeathSaves: DeathSaves,
		},
		data() {
			return {
				slide: this.$store.getters.getSlide,
			}
		},
	};
</script>

<style lang="scss" scoped>
	.slide-wrap {
		padding: 10px;
	}
</style>