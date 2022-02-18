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
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'
	import ViewEntity from './ViewEntity.vue';
	import Conditions from '@/components/combat/Conditions.vue';
	import Reminders from '@/components/combat/Reminders.vue';
	import { dice } from '@/mixins/dice.js';
	import TargetItem from '@/components/combat/TargetItem.vue';
	import DeathSaves from '@/components/combat/DeathSaves.vue';

	export default {
		name: 'TargetInfo',
		mixins: [dice],
		props: ["data"],
		components: {
			ViewEntity,
			Conditions,
			Reminders,
			TargetItem,
			DeathSaves
		},
		firebase() {
			return {
				conditions: {
					source: db.ref('conditions'),
					asObject: true,
				}
			}
		},
		computed: {
			...mapGetters([
				'entities',
			]),
			target: function() {
				return this.entities[this.data.key];
			},
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_targetReminder'
			]),
			showCondition(show) {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'condition',
					condition: show,
					entity: this.target
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
</style>