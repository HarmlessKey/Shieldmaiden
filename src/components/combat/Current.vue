<template>
	<div id="current" class="bg-neutral-6-transparent" v-if="current">
		<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">
			<span>
				<i aria-hidden="true" v-if="current.hidden" class="fas fa-eye-slash red"></i>
				{{ current.name.capitalizeEach() }}
			</span>		
			<a class="btn btn-sm bg-neutral-5" @click="setShowCard">
				<i aria-hidden="true" :class="showCard ? 'fas fa-swords' : 'fas fa-eye'"/>
				<q-tooltip anchor="top middle" self="center middle">
					{{ showCard ? "Show actions" : "Show monster card" }}
				</q-tooltip>
			</a>
		</h2>
		<q-scroll-area 
			:dark="$store.getters.theme === 'dark'" 
			:thumb-style="{ width: '5px'}" 
			v-on:scroll="shadow()" 
			ref="scroll"
			:content-style="{ width: '100%'}"
		> 
			<div class="current">
				<DeathSaves 
					v-if="(current.entityType === 'player' || current.entityType === 'companion')" 
					:target="current"
				/>

				<div class="d-flex justify-content-start">
					<TargetItem :item="current.key" />
				</div>
					
				<Conditions :entity="current" />
				<Reminders :entity="current" />
			</div>

			<div class="px-3 mb-1" v-if="showCard">
				<ViewEntity :data="current" current />
			</div>

			<div v-else class="px-3 py-3">
				<Actions :current="current" />
			</div>
		</q-scroll-area>
	</div>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import Conditions from 'src/components/combat/Conditions.vue';
	import Reminders from 'src/components/combat/Reminders.vue';
	import Actions from 'src/components/combat/actions/Actions.vue';
	import { remindersMixin } from 'src/mixins/reminders';
	import { dice } from 'src/mixins/dice';
	import TargetItem from 'src/components/combat/TargetItem.vue';
	import DeathSaves from 'src/components/combat/DeathSaves.vue';
	import ViewEntity from './ViewEntity.vue';

	export default {
		name: "Current",
		mixins: [remindersMixin, dice],
		components: {
			Actions,
			Conditions,
			Reminders,
			TargetItem,
			DeathSaves,
			ViewEntity
		},
		props: ["current", "next", "settings"],
		data() {
			return {
				setShadow: 0,
				showCardSetter: undefined
			}
		},
		watch: {
			//Watch turn to trigger reminders when an entity starts their turn
			turn(newVal, oldVal) {
				this.checkReminders(this.current, "startTurn");
				this.showCard = false;

				//Check if the turn went up or down	concidering round changes
				//Fails with only 2 entities !!
				if((newVal > oldVal && oldVal != 0) || 
					(newVal > oldVal && oldVal === 0 && newVal === 1) || 
					(newVal === 0 && oldVal > newVal && oldVal !== 1)
				) {
					this.timedReminders(this.current, "up");
				} else {
					//Update next in initiative order
					this.timedReminders(this.next, "down");
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
				"entities",
				"round",
				"turn",
				"targeted",
				"show_monster_card"
			]),
			showCard: {
				get() {
					const show = (this.current.entityType === "npc" && this.show_monster_card) ? true : false;
					return (this.showCardSetter) ? this.showCardSetter : show;
				},
				set(newVal) {
					this.showCardSetter = newVal;
				}
			}
		},
		methods: {
			...mapActions([
				"setSlide",
				"remove_limitedUses",
				"set_show_monster_card"
			]),
			percentage(current, max) {
				return Math.floor(current / max * 100);
			},
			setShowCard() {
				const value = !this.showCard;
				if(this.current.entityType === "npc") {
					this.set_show_monster_card(value);
				} else {
					this.showCard = value;
				}
			},
			shadow() {
				this.setShadow = this.$refs.scroll.scrollPosition;
			}
		}
	}
</script>

<style lang="scss" scoped>
#current {
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
		background-color: $neutral-8-transparent;
		padding: 10px 15px !important;
		margin-bottom: 0 !important;
		line-height: 31px;
		font-size: 18px;

		&.shadow {
			box-shadow: 0 0 10px rgba(0,0,0, 0.9); 
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