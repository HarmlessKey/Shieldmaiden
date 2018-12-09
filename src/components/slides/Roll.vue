<template>
	<div>
		<h2>Dice Roller</h2>
		<div class="roller">
			<span></span>
			<span>Number</span>
			<span>Die</span>
			<span>Mod</span>
			<span>Roll</span>
			<span>Result</span>
		</div>
		<div v-for="item, die in dice" class="roller" :key="die">
			<input v-if="die == 'X'" class="form-control" min="0" type="number" v-model="item.x" name="x" />
			<div v-else class="icon">
				<i :class="item.icon"></i>
			</div>
			<input class="form-control" min="0" type="number" v-model="item.n" name="N" />
			<span>d{{ die }}</span>
			<input class="form-control" type="number" v-model="item.mod" name="mod" />
			<button class="btn" @click="roll(die, item)"><i class="fas fa-dice-d20"></i></button>
			{{ item.result }}
		</div>
		<template v-if="log">
			<hr>
			<h2>Your rolls</h2>
			<ul class="log">
				<li v-for="item in log">
					<h3 class="gray-hover">{{ item.roll }}: <b class="blue">{{ item.total }}</b></h3>
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
					4:{ n: 1, mod: undefined, result: undefined, icon: 'fas fa-dice-d4' },
					6:{ n: 1, mod: undefined, result: undefined, icon: 'fas fa-dice-d6' },
					8: { n: 1, mod: undefined, result: undefined, icon: 'fas fa-dice-d8' },
					10: { n: 1, mod: undefined, result: undefined, icon: 'fas fa-dice-d10' },
					12: { n: 1, mod: undefined, result: undefined, icon: 'fas fa-dice-d12' },
					20: { n: 1, mod: undefined, result: undefined, icon: 'fas fa-dice-d20' },
					100: { n: 1, mod: undefined, result: undefined, icon: 'fas fa-dice-d10' },
					X: { n: 1, mod: undefined, result: undefined, x: undefined }
				},
			}
		},
		methods: {
			roll(d, item) {

				if(d == 'X') {
					var die = item.x
				}
				else {
					var die = d
				}
				let roll = this.rollD(die, item.n, item.mod);
				item.result = roll.total;

				this.log.unshift(roll);

				this.$snotify.success(roll.roll, 'You rolled: ' + roll.total, {
					position: "centerTop"
				});

				item.mod = undefined
				item.n = 1
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
		grid-template-columns: 50px 50px 30px 50px 40px auto;
		grid-template-rows: auto;
		grid-gap: 10px;
		grid-template-areas:
		"icon nmbr die mod btn result";

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