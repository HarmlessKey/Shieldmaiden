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
			<q-input dark filled square dense v-if="die === 'X'" min="0" max="999" type="number" v-model="item.x" name="x" />
			<div v-else class="icon">
				<i :class="item.icon"></i>
				<span class="ml-1 gray-hover">d{{die}}</span>
			</div>
			<q-input dark filled square dense min="0" max="999" type="number" v-model="item.n" name="N" />
			<q-input dark filled square dense type="number" v-model="item.mod" max="999" min="-999" name="mod"/>
			<button class="btn" @click="roll($event, parseInt(die), item)"><i :class="item.icon"></i></button>
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
		methods: {
			roll(e, d, item) {
				item.n = (item.n > 999) ? 999 : item.n;
				item.mod = (item.mod > 999) ? 999 : item.mod;
				item.mod = (item.mod < -999) ? -999 : item.mod;
				item.x = (item.x === undefined) ? 20 : item.x;

				let die = (d === 'X') ? item.x : d;
				if (item.mod === '') {
					item.mod = undefined
				}
				let roll = this.rollD(e, die, item.n, item.mod, `${item.n}d${die} roll`, true);
				item.result = roll.total;

				//Show Natural 1 or Natural 20
				// if(item.n == 1 && die == 20) {
				// 	let throws = '"'+roll.throws+'"'
				// 	if(throws.substring(5, 0) == '"1"') {
				// 		roll.total = 'Natural 1';
				// 	}
				// 	else if(throws.substring(5, 0) == '"20"') {
				// 		roll.total = 'Natural 20';
				// 	}
				// }
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
</style>