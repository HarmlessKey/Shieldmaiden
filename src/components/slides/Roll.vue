<template>
	<div>
		<h2>
			Dice Roller <span class="gray-hover ml-2 text-lowercase d-none d-sm-inline">[r]</span>
			<q-tooltip anchor="bottom middle" self="center middle">
				Press [r] to show/hide
			</q-tooltip>
		</h2>
		<div class="roller">
			<span>Die</span>
			<span>#</span>
			<span>Mod.</span>
			<span>Roll</span>
			<span>Result</span>
		</div>
		<div v-for="(item, die) in dice" class="roller" :key="die">
			<input v-if="die == 'X'" class="form-control" min="0" max="999" type="number" v-model="item.x" name="x" />
			<div v-else class="icon">
				<i :class="item.icon"></i>
				<span class="ml-1 gray-hover">d{{die}}</span>
			</div>
			<input class="form-control" min="0" max="999" type="number" v-model="item.n" name="N" />
			<input class="form-control" type="number" v-model="item.mod" max="999" min="-999" name="mod"/>
			<button class="btn" @click="roll(die, item)"><i :class="item.icon"></i></button>
			<span class="blue">{{ item.result }}</span>
		</div>
		<template v-if="log">
			<hr>
			<h2>Your rolls</h2>
			<ul class="log">
				<li v-for="(item, index) in log" :key="index">
					<h3 v-if="item.total == 'Natural 1' || item.total == 'Natural 20'" 
						class="font-weight-bold"
						:class="[{
							'red': item.total == 'Natural 1',
							'green': item.total == 'Natural 20'}]
					">
						{{ item.total }}!
					</h3>
					<h3 v-else class="gray-hover">{{ item.roll }}: 
						<b class="blue">{{ item.total }}</b>
					</h3>
					<p>{{ item.throws }} {{ item.mod }}</p>
				</li>
			</ul>
		</template>
	</div>
</template>

<script>
	import { dice } from '@/mixins/dice.js'

	export default {
		mixins: [dice],
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
			roll(d, item) {
				item.n = (item.n > 999) ? 999 : item.n;
				item.mod = (item.mod > 999) ? 999 : item.mod;
				item.mod = (item.mod < -999) ? -999 : item.mod;
				item.x = (item.x === undefined) ? 20 : item.x;

				let die = (d === 'X') ? item.x : d;
				if (item.mod === '') {
					item.mod = undefined
				}
				let roll = this.rollD(die, item.n, item.mod, `${item.n}d${die} roll`);
				item.result = roll.total;

				//Show Natural 1 or Natural 20
				if(item.n == 1 && die == 20) {
					let throws = '"'+roll.throws+'"'
					if(throws.substring(5, 0) == '"1"') {
						roll.total = 'Natural 1';
					}
					else if(throws.substring(5, 0) == '"20"') {
						roll.total = 'Natural 20';
					}
					
				}
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
			height: 36px;
		}
		input {
			width: 50px;
			text-align: center;
			padding: 0 0 0 5px;
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