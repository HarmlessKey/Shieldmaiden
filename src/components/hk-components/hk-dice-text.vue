<template>
	<div class="hk-dice-text">
		<span v-for="(line, index) in splitOnXdY(input_text)" :key="index">
			<template v-if="line.dice === undefined">
				{{ line.value }}
			</template>
			<hk-roll 
				v-else
				:tooltip="`Roll ${line.value}`"
				:roll="{
					d: line.dice.d, 
					n: line.dice.n, 
					m: line.dice.m,
					title: roll_title || `Roll ${line.value}`,
					notify: true
				}"
			>
				<strong class="text" style="cursor: pointer;">
					{{ stripSpaces(line.value) }}
				</strong>
			</hk-roll>
		</span>

	</div>
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
			splitOnXdY(input) {
				const xdy_regex = /(\d+[dD]\d+\s?[+-]?\s?\d*)/g;
				let output = input.split(xdy_regex)
				console.log(output)
				output = output.map((line) => {
					return {value: line, dice: this.isXdY(line)}
				})
				console.log(output)
				return output;
			},
			isXdY(input) {
				const xdy_regex = /((\d+)[dD](\d+)\s?[+-]?\s?(\d*))/g;
				let match = input.match(xdy_regex)
				console.log(match)
				if (match !== null) {
					let dice = { d: 4, n: 2, m: 3 }
					return dice;
				}
				return undefined;
			},
			stripSpaces(input) {
				return input.replaceAll(' ', '')
			}
		}
	}
</script>