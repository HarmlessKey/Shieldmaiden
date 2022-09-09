<template>
	<div class="pb-5">
		<h2>
			<span>Hit points</span>
			<span>{{ computed.hit_points }}</span>
		</h2>

		<h3 class="mt-3">Classes</h3>
		

		<div v-for="(subclass, classIndex) in classes" :key="classIndex" class="mt-3">
			<strong>Level {{ subclass.level }} {{ subclass.class || "Class" }}: ({{ classHP(classIndex) }})</strong>
			<p v-html="character.total_class_hp(classIndex, computed.abilities.constitution).info" />
		</div>

		<template v-if="hp_modifiers.length">
			<h3 class="mt-3">Modifiers</h3>
			<div class="modifier" v-for="(modifier, index) in hp_modifiers" :key="`modifier-${index}`">
				<div class="truncate">
					{{ modifier.name }}
				</div>
				<div class="value">
					{{ modifierValue(modifier) > 0 ? `+${modifierValue(modifier)}` : modifierValue(modifier) }}
				</div>
			</div>
		</template>
	</div>
</template>

<script>
	import { dice } from 'src/mixins/dice.js';
	import { dice_types } from 'src/utils/generalConstants';
	import { calc_mod } from 'src/utils/generalFunctions';

	export default {
		name: 'HitPoints',
		mixins: [dice],
		props: ["data"],
		data() {
			return {
				calcMod: calc_mod
			}
		},
		computed: {
			character() {
				return this.data.character
			},
			computed() {
				return this.data.computed
			},
			classes() {
				return this.character.class.classes;
			},
			constitution() {
				const value = this.computed.level * calc_mod(this.computed.abilities.constitution);
				return (value >= 0) ? `+${value}` : `-${value}`;
			},
			hp_modifiers() {
				return this.character.filtered_modifiers_target("hp");
			},
		},
		methods: {
			totalRolled(classIndex) {
				this.character.total_rolled_hp(classIndex)
			},
			average(hit_die) {
				const hit_dice = dice_types.filter(d => {
					return d.value === hit_die;
				});
				return (hit_dice[0]) ? hit_dice[0].average : 0;
			},
			classHP(classIndex) {
				return this.character.total_class_hp(classIndex, this.computed.abilities.constitution).hp;
			},
			modifierValue(modifier) {
				let value = parseInt(modifier.value);

				//Check for scaling
				if(modifier.scaling_type) {
					if(modifier.scaling_type === 'scale') {
						const classKey = modifier.origin.split(".")[1];
						const starting_level = (modifier.origin.split(".")[0] === 'class') ? modifier.origin.split(".")[2] : modifier.scaling_start;
						const current_level = (modifier.origin.split(".")[0] === 'class') ? classes[classKey].level : computed.level;

						//Calculate the increase based on starting level, character-/class-level and the scale
						const increase = parseInt(Math.floor((current_level - starting_level) / modifier.scale_size));

						//Add the increase to the starting value
						value = value + increase * parseInt(modifier.scale_value);
					} else if(modifier.scaling_type === 'steps') {
						//define how step scaling is handled
					}
				}
				return value;
			}
		}
	};
</script>

<style lang="scss" scoped>
	h2 {
		font-family: 'Fredericka the Great', cursive !important;
		text-transform: none !important;
		display: flex;
		justify-content: space-between;
	}
	h3 {
		font-size: 18px !important;
		margin-bottom: 10px !important;
		font-weight: bold !important;
	}
	.modifier {
		font-size: 15px;
		display: grid;
		grid-template-columns: 1fr max-content;
		width: 100%;
		border-bottom: solid 1px #5c5757;
		line-height: 30px;
		grid-column-gap: 10px;

		.value {
			color: #fff;
			font-size: 20px;
			font-family: 'Fredericka the Great', cursive !important;
		}
	}

</style>
