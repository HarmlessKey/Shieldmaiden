<template>
	<span class="hk-dice-text">
		<span v-for="(line, index) in splitOnRollable(input_text)" :key="index">
			<span v-if="line.dice === undefined">
				{{ line.value }}
			</span>
			<hk-roll 
				v-else
				:tooltip="`Roll ${dice2str(line.dice)}`"
				:roll="{
					d: line.dice.d, 
					n: line.dice.n, 
					m: line.dice.m,
					title: roll_title || `Roll ${dice2str(line.dice)}`,
					notify: true
				}"
			>
				<strong class="text" style="cursor: pointer;">
					{{ line.value }}
				</strong>
			</hk-roll>
		</span>

	</span>
</template>

<script>
	export default {
		name: 'hk-dice-text',
		props: {
			input_text: {
				type: String,
				default: undefined
			},
			roll_title: {
				type: String,
				default: undefined
			}
		},
		methods: {
			splitOnRollable(input) {
				const rollable_regex = /(\d+[dD]\d+\s?[+-]?\s?\d*)|([+-]\s?\d+\sto\shit)/g;
				let output = input.split(rollable_regex)
				// console.log("output", output)
				output = output.map((line) => {
					return {value: line, dice: this.isXdY(line)}
				})
				return output;
			},
			isXdY(input) {
				//              =   (Number)[dD]( Dice  )          (Modifier)
				const xdy_regex = /(?<n>\d+)[dD](?<d>\d+)\s?(?<m>[+-]?\s?\d*)/g;
				let match = xdy_regex.exec(input);
				// let match = input.match(xdy_regex)
				if (match !== null) {
					// console.log(match.groups.m)
					let dice = { 
						d: match.groups.d,
						n: match.groups.n,
						m: parseInt(this.stripSpaces(match.groups.m)) || 0
					}
					return dice;
				}

				const hit_regex = /(?<hit>[+-]\s?\d+)\sto\shit/g;
				match = hit_regex.exec(input)
				if (match !== null) {
					let dice = {
						d: 20,
						n: 1,
						m: match.groups.hit
					}
					return dice
				}
				return undefined;
			},
			stripSpaces(input) {
				return input.replaceAll(' ', '')
			},
			dice2str(dice) {
				let dice_str =  `${dice.n}d${dice.d}`;
				dice_str += (dice.m > 0 ? `+${dice.m}` : `${dice.m}`);
				return dice_str
			}
		}
	}
</script>