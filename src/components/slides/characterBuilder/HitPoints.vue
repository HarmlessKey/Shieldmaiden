<template>
	<div class="pb-5">
		<h2>
			<span>Hit points</span>
			<span>{{ data.total }}</span>
		</h2>

		<h3>
			Constitution
			<hk-popover header="Constitution" content="For every character level, you add the constitution modifier to the hit points.">
			<i class="fas fa-info-circle blue" aria-hidden="true" />
			</hk-popover>
		</h3>
		<div class="modifier">
			<div class="truncate">
				Level ({{ data.level }}) <i class="fas fa-times mx-2" aria-hidden="true" /> Constitution modifier ({{ data.con_mod }})
			</div>
			<div class="value">
				{{ constitution }}
			</div>
		</div>

		<h3 class="mt-3">Classes</h3>
		<div v-for="(subclass, key) in data.classes" :key="key" class="mt-3">
			<strong>Level {{ subclass.level }} {{ subclass.name || "Subclass" }}: ({{ classHP(key, subclass.level, subclass.hit_dice).total }})</strong>
			<div class="modifier" v-if="key == 0">
				<div class="truncate">
					Full hit die at level 1
				</div>
				<div class="value">
					+{{ subclass.hit_dice || 0 }}
				</div>
			</div>
			<div class="modifier" v-if="key == 0 && subclass.level > 1 || key != 0">
				<div class="truncate">
					<template v-if="data.hit_point_type === 'rolled'">
						Rolled {{ key == 0 ? subclass.level - 1 : subclass.level }}d{{ hit_dice }}
					</template>
					<template v-else>
						{{ key == 0 ? subclass.level - 1 : subclass.level }} average hit dice ({{ average(subclass.hit_dice) }})
					</template>
				</div>
				<div class="value">
					+{{ classHP(key, subclass.level, subclass.hit_dice).fixed }}
				</div>
			</div>
		</div>

		<h3 class="mt-3">Modifiers</h3>
		<div class="modifier" v-for="(modifier, index) in data.modifiers" :key="`modifier-${index}`">
			<div class="truncate">
				{{ modifier.name }}
			</div>
			<div class="value">
				{{ modifierValue(modifier) }}
			</div>
		</div>
	</div>
</template>

<script>
	import { dice } from 'src/mixins/dice.js';
	import { dice_types } from 'src/utils/generalConstants';

	export default {
		name: 'HitPoints',
		mixins: [dice],
		props: ["data"],
		data() {
			return {
				
			}
		},
		computed: {
			constitution() {
				const value = this.data.level * this.data.con_mod;
				return (value >= 0) ? `+${value}` : `-${value}`;
			}
		},
		methods: {
			totalRolled(classKey) {
				let totalRolled = 0;
				for(const [key, value] of Object.entries(this.data.classes[classKey].rolled_hit_points)) {
					if(this.data.classes[classKey].level >= key && value) {
						totalRolled = totalRolled + parseInt(value);
					}
				}
				return totalRolled;
			},
			average(hit_die) {
				const hit_dice = dice_types.filter(dice => {
					return dice.value === hit_die;
				});
				const average = (hit_dice[0]) ? hit_dice[0].average : 0;

				return average;
			},
			classHP(key, level, hit_dice) {
				let classHp = {
					total: (key == 0) ? hit_dice : 0,
					rolled: 0
				}
				if(key == 0) level = level - 1;

				classHp.fixed = (this.data.hit_point_type === 'rolled') ? this.totalRolled(key) : this.average(hit_dice) * level;
				classHp.total = (this.data.hit_point_type === 'rolled') ? classHp.total + classHp.rolled : classHp.total + classHp.fixed;

				return classHp;
			},
			modifierValue(modifier) {
				let value = parseInt(modifier.value);

				//Check for scaling
				if(modifier.scaling_type) {
					if(modifier.scaling_type === 'scale') {
						const classKey = modifier.origin.split(".")[1];
						const starting_level = (modifier.origin.split(".")[0] === 'class') ? modifier.origin.split(".")[2] : modifier.scaling_start;
						const current_level = (modifier.origin.split(".")[0] === 'class') ? this.data.classes[classKey].level : this.data.level;

						//Calculate the increase based on starting level, character-/class-level and the scale
						const increase = parseInt(Math.floor((current_level - starting_level) / modifier.scale_size));

						//Add the increase to the starting value
						value = value + increase * parseInt(modifier.scale_value);
					} else if(modifier.scaling_type === 'steps') {
						//define how step scaling is handled
					}
				}

				return (value >= 0) ? `+${value}` : value;
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
