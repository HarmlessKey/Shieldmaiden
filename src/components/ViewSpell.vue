<template>
	<div class="spell">
		<div class="spell__title">
			<h3>{{ spell.name }} <span class="source gray-hover">{{ spell.source }}</span></h3>
			<i>
				<template v-if="spell.level === 0">Cantrip </template>
				<template v-else>{{ spell.level | numeral('0o') }}-level </template>
				{{ spell.school }}
			</i>
		</div>

		<div class="spell__info">
			<b>Casting time:</b> {{ spell.cast_time_nr }} {{spell.cast_time_type }}<br/>
			<b>Range:</b> {{ range }}<br/>
			<b>Components: </b>
			<template v-if="spell.components.verbal">V </template>
			<template v-if="spell.components.somatic">S </template>
			<template v-if="spell.components.material">M </template>
			{{ spell.material_description ? `(${spell.material_description})` : "" }}
			<br/>
			<b>Duration:</b> {{ duration }}<br/>
				<template v-if="spell.classes">
					<b>Classes:</b> 
					<template v-for="(_class, index) in spell.classes">
						{{ _class }}<template v-if="Object.keys(spell.classes).length > index + 1">, </template>
					</template>
				</template>
		</div>

		<div class="spell__description">
			<vue-markdown name="description" :source="spell.description"/>
			<div v-if="spell.higher_level">
				<b class="pl-2"><i>At Higher Levels.</i></b> {{ spell.higher_level }}
			</div>
		</div>

		<div class="actions" v-if="spell.actions && !no_roll">
			<h4 class="mb-3">Roll spell</h4>

			<div class="input" v-if="spell.level_scaling === 'character_level'">
				<q-input
					dark filled square dense
					label="Character level"
					id="casterLevel" 
					type="number"
					v-validate="'required|numeric|max_value:20'"
					name="casterLevel"
					data-vv-as="caster level"
					v-model="casterLevel"
				/>
				<div class="validate red" v-if="errors.has('casterLevel')">{{ errors.first('casterLevel') }}</div>
			</div>

			<!-- TO HIT MODIFIER INPUT -->
			<div class="input" v-if="isToHit">
				<q-input
					dark filled square dense
					label="To hit modifier"
					id="toHit" 
					type="text"
					v-validate="'required|numeric'"
					name="toHit"
					data-vv-as="To hit modifier"
					v-model="toHitModifier"
				/>
				<div class="validate red" v-if="errors.has('toHit')">{{ errors.first('toHit') }}</div>
			</div>

			<!-- ADVANTAGE INPUT -->
			<div v-if="isToHit" class="advantage d-flex justify-content-between">
				<button class="btn btn-sm bg-gray-hover" :class="{ 'bg-green': advantage == 'advantage' }" @click="setAdvantage('advantage')">
					<i v-if="advantage == 'advantage'" class="fas fa-check"></i>
					Advantage
				</button>
				<button class="btn btn-sm bg-gray-hover" :class="{ 'bg-green': advantage == 'disadvantage' }" @click="setAdvantage('disadvantage')">
					<i v-if="advantage == 'disadvantage'" class="fas fa-check"></i>
					Disadvantage
				</button>
			</div>

			<!-- SPELL LEVEL INPUT -->
			<template v-if="spell.level > 0">
				<p>Select Casting level</p>
				<div class="actions__levels">
					<div 
						class="level"
						:class="{ 
							selected: selectedLevel === i,
							disabled: i < spell.level
						}"
						v-for="i in 9"
						:key="i"
						@click="(spell.level <= i) ? selectLevel(i) : null"
					>
						{{ i }}
					</div>
				</div>
			</template>

			<!-- ROLL SPELL -->
			<button 
				:disabled="errors.items && errors.items.length > 0 || missingRequired"
				class="btn btn-block mt-3" 
				@click="roll(spell, selectedLevel, casterLevel, toHitModifier)"
			>
				Roll
			</button>
		</div>
	</div>
</template>

<script>
	import { spells } from '@/mixins/spells.js';
	import VueMarkdown from 'vue-markdown';
	import { damage_types } from '@/mixins/damageTypes.js';

	export default {
		name: 'Spell',
		mixins: [spells, damage_types],
		components: {
			VueMarkdown
		},
		props: [
			'data',
			'no_roll',
		],
		data() {
			return {
				spell: this.data,
				selectedLevel: this.data.level,
				casterLevel: undefined,
				toHitModifier: undefined,
				advantage: false,
				rolled: undefined,
				savingThrow: undefined,
				hitOrMiss: undefined,
				resistances: {},
				resultColumns: {
					total: {
						maxContent: true
					},
					type: {
						truncate: true
					}
				}
			}
		},
		computed: {
			duration() {
				const type = this.spell.duration_type;
				const n = this.spell.duration_n;
				const scale = this.spell.duration_scale;

				if(type === 'concentration') {
					let dur_scale = (n === 1) ? scale : scale+'s';
					return `Concentration, up to ${n} ${dur_scale}`;
				}
				if(type === 'Time') {
					let dur_scale = (n === 1) ? scale : scale+'s';
					return `${n} ${dur_scale}`;
				}
				return type;
			},
			range() {
				const type = this.spell.range_type;
				const range = this.spell.range;

				if(type === 'ranged') {
					return `${range} feet`;
				}

				return type;
			},
			isToHit() {
				//Checks if there is an action with to hit.
				let toHit = false;

				for(let action of this.spell.actions) {
					if(action.type === 'melee_weapon' || action.type === 'ranged_weapon' || action.type === 'spell_attack') {
						toHit = true;
					}
				}
				return toHit;
			},
			missingRequired() {
				let missing = false;

				if(this.isToHit && this.toHitModifier === undefined) {
					missing = true;
				}
				if(this.spell.level_scaling === 'character_level' && this.casterLevel === undefined) {
					missing = true;
				}
				return missing;
			}
		},
		methods: {
			selectLevel(i) {
				this.selectedLevel = i;
			},
			roll(spell, selectedLevel, casterLevel, toHitModifier) {
				this.rolled = this.rollSpell(spell, selectedLevel, casterLevel, toHitModifier, this.advantage);
			},
			totalDamage(action, rolls) {
				let total = parseInt(rolls.modifierRoll.total);

				if(rolls.scaledRoll) {
					total = total + rolls.scaledRoll.total;
				}
				if(action.type === 'spell_save' && this.savingThrow === 'save') {
					total = Math.floor(total * rolls.missSave);
				}
				if(action.toHit && this.hitOrMiss === 'miss') {
					total = Math.floor(total * rolls.missSave);
				}
				if(this.resistances[rolls.subtype] === 'v') {
					total = total * 2;
				}
				if(this.resistances[rolls.subtype] === 'r') {
					total = Math.floor(total / 2);
				}
				if(this.resistances[rolls.subtype] === 'i') {
					total = 0;
				}
				return total;
			},
			setSave(save) {
				this.savingThrow = (save !== this.savingThrow) ? save : undefined;
			},
			setHitOrMiss(result) {
				this.hitOrMiss = (result !== this.hitOrMiss) ? result : undefined;
			},
			setAdvantage(value) {
				this.advantage = (value !== this.advantage) ? value : false;
			},
			setDefense(type, resistance) {
				if(this.resistances[type] === resistance) {
					this.$delete(this.resistances, type);
				} else {
					this.$set(this.resistances, type, resistance);
				}
			},
			missSaveEffect(effect, type) {
				if(type === 'text') {
					if(effect === 1) {
						return 'full damage';
					}
					if(effect === .5) {
						return 'half damage';
					}
					if(effect === 0) {
						return 'no damage';
					}
				} else {
					if(effect === 1) {
						return '';
					}
					if(effect === .5) {
						return '/ 2';
					}
					if(effect === 0) {
						return 'no effect';
					}
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
.spell {
	&__title {
		margin-bottom: 15px;

		h3 {
			margin-bottom: 5px;

			.source {
				font-size: 12px;
			}
		}
	}
	&__info {
		margin-bottom: 15px;
	}
	&__description {
		margin-bottom: 15px;
	}

	.advantage {
		.btn {
			width: 48%;
		}
	}
	.actions {
		margin-bottom: 15px;

		.input {
			display: grid;
			grid-template-columns: 1fr 50px;
			margin-bottom: 10px;

			.validate {
				grid-column: span 2;
			}
		}

		&__levels {
			display: flex;
			justify-content: flex-start;
			margin: 0 -5px;

			.level {
				width: 30px;
				height: 30px;
				line-height: 30px;
				text-align: center;
				cursor: pointer;
				background-color:$gray-dark;
				user-select: none;
				margin: 0 3px;

				&.selected {
					background-color: $blue;
					color:$neutral-1; 
				}
				&.disabled {
					opacity: .4;
					cursor: not-allowed;
				}
			}
		}
	}

	.rolled {
		h2 {
			text-transform: none !important;
			font-size: 25px;
		}

		.save {
			a {
				margin-left: 5px;
			}
		}
		.defenses {
			display: grid;
			grid-template-columns: 1fr 18px 18px 18px;
			grid-column-gap: 5px;
			user-select: none;
			margin-bottom: 1px;
			padding: 2px 5px;

			&:hover {
				background-color:$gray-dark;
			}
			.icon {
				padding: 3px 0;
			}
			.option {
				cursor: pointer;
				position: relative;
				width: 18px;
				font-size: 18px;
				text-align: center;
				line-height: 28px;

				span {
					font-size: 12px;
					text-align: center;
					font-weight: bold;
					position: absolute;
					width: 18px;
					line-height: 28px;
					top: 0;
					left: 0;
					color:$gray-dark;
				}

				&.green, &.red, &.blue {
					span {
						color:$neutral-1;
					}
				}
			}
		}
	}
} 

</style>
