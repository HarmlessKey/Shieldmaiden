<template>
	<div>
		<!-- {{ slide }} -->
		<Roll v-if="slide.type == 'roll'"/>
		<NPC v-if="slide.type == 'npc'" :entity="slide.entity" />
		<AddNpc v-if="slide.type == 'addNpc'" />
		<EditNpc v-if="slide.type == 'editNpc'" :npc="slide.npc" :npcKey="slide.key" />
		<Condition v-if="slide.type == 'condition'" :condition="slide.condition" :entity="slide.entity" />
		<Conditions v-if="slide.type == 'conditions'" :entity="slide.entity" />
		<Edit v-if="slide.type == 'edit'" :entityKey="slide.key" :entity="slide.entity" />
		<Transform v-if="slide.type == 'transform'" :entityKey="slide.key" :entity="slide.entity" />
		<DeathSaves v-if="slide.type == 'deathSaves'" />
		<DamageHealing v-if="slide.type == 'damageHealing'" :target="slide.target" />
		<Track v-if="slide.type == 'track'" />
		<Settings v-if="slide.type == 'settings'" />
		<TargetReminders v-if="slide.type == 'targetReminders'" :entityKey="slide.key" />
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
	import Transform from '@/components/slides/Transform.vue';
	import DeathSaves from '@/components/slides/DeathSaves.vue';
	import DamageHealing from '@/components/slides/DamageHealing.vue';
	import Track from '@/components/slides/Track.vue';
	import Settings from '@/components/slides/Settings.vue';
	import TargetReminders from '@/components/slides/TargetReminders.vue';

	export default {
		components: {
			Roll: Roll,
			NPC: NPC,
			AddNpc: AddNpc,
			EditNpc: EditNpc,
			Condition: Condition,
			Conditions: Conditions,
			Edit: Edit,
			Transform: Transform,
			DeathSaves: DeathSaves,
			DamageHealing: DamageHealing,
			Track: Track,
			Settings: Settings,
			TargetReminders: TargetReminders,
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