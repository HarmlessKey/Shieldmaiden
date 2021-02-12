<template>
	<div id="current" v-if="current">
		<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">
			<i v-if="current.hidden" class="fas fa-eye-slash red"></i> 
			{{ current.name }}
		</h2>
		<q-scroll-area dark :thumb-style="{ width: '5px'}" v-on:scroll="shadow()" ref="scroll"> 
			<div class="current">
				<template v-if="current">
					<DeathSaves 
						v-if="(current.entityType === 'player' || current.entityType === 'companion')" 
						:target="current"
					/>

					<TargetItem :item="current.key" class="mb-2" />

					<Conditions :entity="current" />
					<Reminders :entity="current" />
				</template>
				<div v-else class="loader"><span>Loading current...</span></div>
			</div>
			<div class="px-3 py-3">
				<Actions :current="current" :settings="settings" />
			</div>
		</q-scroll-area>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import Conditions from '@/components/combat/Conditions.vue';
	import Reminders from '@/components/combat/Reminders.vue';
	import Actions from '@/components/combat/actions/Actions.vue';
	import { remindersMixin } from '@/mixins/reminders';
	import TargetItem from '@/components/combat/TargetItem.vue';
	import DeathSaves from '@/components/combat/DeathSaves.vue';

	export default {
		name: 'Current',
		mixins: [remindersMixin],
		components: {
			Actions,
			Conditions,
			Reminders,
			TargetItem,
			DeathSaves
		},
		props: ['current', 'next', 'settings'],
		data() {
			return {
				setShadow: 0,
			}
		},
		firebase() {
			return {
				conditions: {
					source: db.ref('conditions'),
					asObject: true,
				}
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
		height: calc(100% - 30px);
	}
	h2.componentHeader {
		padding: 10px 15px !important;
		margin-bottom: 0 !important;

		&.shadow {
			box-shadow: 0 0 10px rgba(0,0,0,0.9); 
		}
	}
	.btn.save {
		width: 49.5%;
	}
	.health {
		display: grid;
		grid-template-columns: 30px 1fr;
		grid-template-rows: auto;
		grid-gap: 0;
		grid-template-areas: 
		"img hp-bar";

		margin-bottom: 5px;

		&.target {
			grid-template-columns: 30px 30px 1fr;
			grid-template-areas: 
			"img ac hp-bar";
		}

		.img {
			background-color:$gray-dark;
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;
			font-size: 20px;
			line-height: 30px;
			text-align: center;
			grid-area: img;
			border: solid 1px transparent;
		}
		.ac {
			text-align:center;
			line-height: 30px;
			background-color:#191919;
			font-weight:bold;
			color:$gray-light;
			grid-area: ac;
		}
		.progress { 
			height: 30px;
			line-height: 30px;
			background-color:$gray-active;
			position: relative;

			span.hp, span.percentage {
				
				color:#fff;
				position: absolute;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			span.hp {
				text-align: right;
				right: 5px;
			}
			span.percentage {
				left: 5px;
			}
		}
	}
	.conditions {
		margin-bottom: 10px;
		display: grid;
		grid-template-columns: repeat(auto-fill, 30px);
		grid-auto-rows: 30px;
		grid-gap: 1px;

		svg, .n {
			display: block;
			font-size: 16px;
			width: 30px;
			height: 30px;
			line-height: 26px;
			text-align: center;
			fill:$red;
			color:$red;
			background-color:$gray-active;
			padding: 2px;
			cursor: pointer;
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