<template>
	<div>
		<DeathSaves 
			v-if="(target.entityType === 'player' || target.entityType === 'companion')" 
			:target="target"
		/>
		
		<TargetItem :item="target.key" />
		<Conditions :entity="target" />
		<Reminders :entity="target" />
		<ViewEntity class="mt-3 hide" :data="target" />

	</div>
</template>

<script>
	import { mapGetters } from 'vuex'
	import ViewEntity from './ViewEntity.vue';
	import Conditions from 'src/components/combat/Conditions.vue';
	import Reminders from 'src/components/combat/Reminders.vue';
	import TargetItem from 'src/components/combat/TargetItem.vue';
	import DeathSaves from 'src/components/combat/DeathSaves.vue';

	export default {
		name: 'TargetInfo',
		props: ["data"],
		components: {
			ViewEntity,
			Conditions,
			Reminders,
			TargetItem,
			DeathSaves
		},
		computed: {
			...mapGetters([
				'entities',
			]),
			target: function() {
				return this.entities[this.data.key];
			},
		}
	}
</script>