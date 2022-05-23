<template>
	<div id="current" v-if="current">
		<div class="bg-neutral-6 current">
			<div>Up now:</div>
			<TargetItem :item="current.key" />
			<a 
				@click="setSlide({
					show: true,
					type: 'combat/TargetInfo',
					data: { key: current.key }
				})"
			>
				<q-icon name="info" />
			</a>
		</div>
		<div 
			class="saves bg-neutral-8" 
			v-if="(current.entityType === 'player' || current.entityType === 'companion') && current.curHp === 0 && !current.stable && !current.dead"
		>
			<DeathSaves :target="current" />
		</div>
	</div>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import TargetItem from 'src/components/combat/TargetItem.vue';
	import DeathSaves from 'src/components/combat/DeathSaves.vue';

	export default {
		name: 'Current',
		components: {
			TargetItem,
			DeathSaves
		},
		props: ['current', 'next', 'settings'],
		data() {
			return {
				setShadow: 0,
			}
		},
		watch: {
			//Watch turn to trigger reminders when an entity starts their turn
			turn(newVal, oldVal) {
				this.checkReminders(this.current, 'startTurn');

				//Check if the turn went up or down	concidering round changes
				//Fails with only 2 entities
				if((newVal > oldVal && oldVal != 0) || 
					(newVal > oldVal && oldVal === 0 && newVal === 1) || 
					(newVal === 0 && oldVal > newVal && oldVal !== 1)
				) {
					this.timedReminders(this.current, 'up');
				} else {
					//Update next in initiative order
					this.timedReminders(this.next, 'down');
				}
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'round',
				'turn',
				'targeted',
			])
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
		}
	}
</script>

<style lang="scss" scoped>
	.current {
		display: grid;
		grid-template-columns: 70px 1fr 35px;
		line-height: 35px;
		padding: 10px;

		a {
			color:  $neutral-2;
			line-height: 35px;
			width: 35px;
			text-align: right;
			height: 35px;
			font-size: 28px;

			.q-icon {
				vertical-align: -4px;
			}
		}
	}
	.saves {
		padding: 10px;
	}
</style>