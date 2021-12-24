<template>
	<div>
		<div class="roller">
			<span>Die</span>
			<span>#</span>
			<span>Mod.</span>
			<span>Roll</span>
			<span>Result</span>
		</div>
		<div v-for="(item, die) in dice" class="roller" :key="die">
			<q-input :dark="$store.getters.theme === 'dark'" filled square dense v-if="die === 'X'" min="0" max="999" type="number" v-model="item.x" name="x" />
			<div v-else class="icon">
				<i :class="item.icon"></i>
				<span class="ml-1 neutral-2">d{{die}}</span>
			</div>
			<q-input :dark="$store.getters.theme === 'dark'" filled square dense min="0" max="999" type="number" v-model="item.n" name="N" />
			<q-input :dark="$store.getters.theme === 'dark'" filled square dense type="number" v-model="item.mod" max="999" min="-999" name="mod"/>
			
			<hk-roll 
				tooltip="1d20 roll"
				v-if="die == 20 && item.n == 1"
				@roll="roll($event, die, item)"
			>
				<button class="btn">
					<i :class="item.icon"></i>
				</button>
			</hk-roll>

			<button v-else class="btn" @click="roll($event, die, item)"><i :class="item.icon"></i></button>
			
			<span class="blue">{{ item.result }}</span>
		</div>
		<template v-if="log">
			<hr>
			<h2>Recent rolls</h2>
			<Rolls :rolls="log" />
		</template>
	</div>
</template>

<script>
	import { dice } from '@/mixins/dice.js'
	import Rolls from './Rolls';
	import { mapGetters } from "vuex";

	export default {
		name: "DiceRoller",
		mixins: [dice],
		components: {
			Rolls
		},
		data() {
			return {
				result: '',
				log: [],
				dice: {
					4:{ n: 1, mod: undefined, result: undefined, icon: 'fad fa-dice-d4' },
					6:{ n: 1, mod: undefined, result: undefined, icon: 'fad fa-dice-d6' },
					8: { n: 1, mod: undefined, result: undefined, icon: 'fad fa-dice-d8' },
					10: { n: 1, mod: undefined, result: undefined, icon: 'fad fa-dice-d10' },
					12: { n: 1, mod: undefined, result: undefined, icon: 'fad fa-dice-d12' },
					20: { n: 1, mod: undefined, result: undefined, icon: 'fad fa-dice-d20' },
					100: { n: 1, mod: undefined, result: undefined, icon: 'fad fa-dice-d10' },
					X: { n: 1, mod: undefined, result: undefined, x: undefined, icon: 'fad fa-dice-d20' }
				},
			}
		},
		computed: {
			...mapGetters([
				"broadcast",
				"encounterId"
			]),
			share() {
				return (this.broadcast.shares && this.broadcast.shares.includes("general_rolls")) || false;
			}
		},
		methods: {
			roll(e, d, item) {
				let advantage = {};
				// Check if e is wrapped in other e
				if ('e' in e) {
					advantage = e.advantage_disadvantage;
					e = e.e;
				}

				item.n = (item.n > 999) ? 999 : item.n;
				item.mod = (item.mod > 999) ? 999 : item.mod;
				item.mod = (item.mod < -999) ? -999 : item.mod;
				item.x = (item.x === undefined) ? 20 : item.x;

				let die = (d === 'X') ? item.x : d;
				if (item.mod === '') {
					item.mod = undefined
				}
				let roll = this.rollD(
					e, parseInt(die), item.n, item.mod, 
					`${item.n}d${die} roll`, 
					undefined, true, advantage,
					this.share ? {
						encounter_id: this.encounterId
					} : null
				);
				item.result = roll.total;

				this.log.unshift(roll);
			}
		}
	};
</script>

<style lang="scss" scoped>
	h2 {
		margin-bottom: 5px !important;
	}
	.roller {
		display: grid;
		grid-template-columns: 50px 50px 50px 40px auto;
		grid-template-rows: auto;
		grid-gap: 10px;
		grid-template-areas:
		"icon nmbr mod btn result";

		margin-bottom: 2px;
		line-height: 35px;
		text-align:center;

		.btn {
			height: 40px;
			width: 40px;
		}
		.icon {
			height: 100%;
			display: flex;
			align-items: center;

			svg {
				margin: 0 auto;
				font-size: 20px;
			}
			
		}
	}
	.log {
		list-style: none;
		padding: 0;

		h3 {
			font-size: 20px !important;
			margin-bottom: 5px !important;
		}
	}
	.advantage .btn:hover {
		background-color: $green;
	}
	.disadvantage .btn:hover {
		background-color:$red;
	}
</style>