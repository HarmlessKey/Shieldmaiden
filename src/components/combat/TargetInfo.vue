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
	import Conditions from '@/components/combat/Conditions.vue';
	import Reminders from '@/components/combat/Reminders.vue';
	import TargetItem from '@/components/combat/TargetItem.vue';
	import DeathSaves from '@/components/combat/DeathSaves.vue';

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