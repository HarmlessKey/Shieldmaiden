<template>
	<div id="current" v-if="current">
		<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">
			<span>
				<i v-if="current.hidden" class="fas fa-eye-slash red"></i>
				<q-badge v-if="current.old" label="DEPRECATED" color="red" />
				{{ current.name.capitalizeEach() }}
			</span>
			<a class="show" @click="showCard = !showCard">
				<i :class="showCard ? 'fas fa-swords' : 'fas fa-eye'"/>
				<q-tooltip anchor="top middle" self="center middle">
					{{ showCard ? "Show actions" : "Show monster card" }}
				</q-tooltip>
			</a>
		</h2>
		<p v-if="current.old" class="red px-3">
			Some values might not show, or show incorrectly. 
			Please update your NPC at the
			<router-link to="/npcs">NPC's page</router-link>.
		</p>
		<q-scroll-area dark :thumb-style="{ width: '5px'}" v-on:scroll="shadow()" ref="scroll"> 
			<div class="current">
				<DeathSaves 
					v-if="(current.entityType === 'player' || current.entityType === 'companion')" 
					:target="current"
				/>

				<TargetItem :item="current.key" />
					
				<Conditions :entity="current" />
				<Reminders :entity="current" />
			</div>

			<div class="px-3 mb-1" v-if="showCard">
				<ViewEntity :data="current" />
			</div>

			<div v-else class="px-3 py-3">
				<Actions :current="current" :settings="settings" />
			</div>
		</q-scroll-area>
	</div>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import Conditions from '@/components/combat/Conditions.vue';
	import Reminders from '@/components/combat/Reminders.vue';
	import Actions from '@/components/combat/actions/Actions.vue';
	import { remindersMixin } from '@/mixins/reminders';
	import { dice } from '@/mixins/dice';
	import TargetItem from '@/components/combat/TargetItem.vue';
	import DeathSaves from '@/components/combat/DeathSaves.vue';
	import ViewEntity from '@/components/ViewEntity.vue';

	export default {
		name: 'Current',
		mixins: [remindersMixin, dice],
		components: {
			Actions,
			Conditions,
			Reminders,
			TargetItem,
			DeathSaves,
			ViewEntity
		},
		props: ['current', 'next', 'settings'],
		data() {
			return {
				setShadow: 0,
				showCard: false
			}
		},
		watch: {
			//Watch turn to trigger reminders when an entity starts their turn
			turn(newVal, oldVal) {
				this.checkReminders(this.current, 'startTurn');
				this.showCard = false;

				//Check if the turn went up or down	concidering round changes
				//Fails with only 2 entities !!
				if((newVal > oldVal && oldVal != 0) || 
					(newVal > oldVal && oldVal === 0 && newVal === 1) || 
					(newVal === 0 && oldVal > newVal && oldVal !== 1)
				) {
					this.timedReminders(this.current, 'up');
				} else {
					//Update next in initiative order
					this.timedReminders(this.next, 'down');
				}

				// Check limited uses
				if(this.current.limited_uses && Object.keys(this.current.limited_uses).length > 0) {
					// Check all actions for limited uses that can be regained at the start of the turn
					const categories = ["special_abilities", "actions", "legendary_actions", "reactions"];

					for(const category of categories) {
						if(this.current[category] && this.current.limited_uses[category]) {
							this.current[category].forEach((ability, index) => {
								// Remove abilities from limited uses
								if((ability.limit && ability.limit_type === "turn") || ability.recharge) {
									let remove = true;
									// For recharge, roll to see if the ability is regained
									if(ability.recharge && ability.recharge !== "rest" && this.current.limited_uses[category][index]) {
										let values = ability.recharge.split("-");
										const dice_type = (values.length > 1) ? values[1] : values[0];

										const roll = this.rollD({}, dice_type, 1, 0, `Recharge ${ability.name}`).total;
										if(roll < values[0]) remove = false; // Don't remove if the roll was too low

										const title = (remove) ? `Recharged ${ability.name}` : `Recharge failed ${ability.name}`;
										const message = `${roll} Was rolled for a recharge of ${ability.recharge}.`;

										//Notify about the recharge
										this.$snotify.warning(
											message,
											title, 
											{
												timeout: 0
											}
										);
									}
									if(remove) this.remove_limitedUses({key: this.current.key, category, index});
								} 
							});
							// Remove legendaries_used
							if(category === "legendary_actions") {
								this.remove_limitedUses({key: this.current.key, category, index: "legendaries_used"});
							}
						}
					}
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
				'setSlide',
				'remove_limitedUses'
			]),
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100);
				return hp_percentage;
			},
			shadow() {
				this.setShadow = this.$refs.scroll.scrollPosition;
			}
		}
	}
</script>

<style lang="scss" scoped>
#current {
	background: rgba(38, 38, 38, .9);
	grid-area: current;
	overflow: hidden;
	
	.current {
		padding: 10px;
	}
	
	.q-scrollarea {
		height: calc(100% - 55px);
	}
	h2.componentHeader {
		display: flex;
		justify-content: space-between;
		padding: 10px 15px !important;
		margin-bottom: 0 !important;

		&.shadow {
			box-shadow: 0 0 10px rgba(0,0,0,0.9); 
		}
	}
}
@media only screen and (max-width: 600px) {
	#current {
		overflow: visible !important;
	}
	.hide {
		display: none;
	}
}

</style>