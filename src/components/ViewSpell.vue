<template>
	<div class="spell">
		<div class="spell__title">
			<h3>{{ spell.name }} <span class="source gray-hover">{{ spell.source }}</span></h3>
			<i>
				<template v-if="spell.level === 0">Cantrip </template>
				<template v-else>{{ spell.level | numeral('0o') }} </template>
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
			<div>{{ spell.description }}</div>
			<div v-if="spell.higher_level">
				<b class="pl-2"><i>At Higher Levels.</i></b> {{ spell.higher_level }}
			</div>
		</div>

		<div class="actions" v-if="spell.actions">
			<h4 class="mb-3">Roll spell</h4>

			<div class="input" v-if="spell.level_scaling === 'Character Level'">
				<label for="casterLevel">Character level</label>
				<b-form-input
					id="casterLevel" 
					type="text"
					v-validate="'required|numeric'"
					name="casterLevel"
					data-vv-as="caster level"
					v-model="casterLevel"
				/>
				<div class="validate red" v-if="errors.has('casterLevel')">{{ errors.first('casterLevel') }}</div>
			</div>

			<div class="input" v-if="isToHit">
				<label for="toHit">To hit modifier</label>
				<b-form-input
					id="toHit" 
					type="text"
					v-validate="'required|numeric'"
					name="toHit"
					data-vv-as="To hit modifier"
					v-model="toHitModifier"
				/>
				<div class="validate red" v-if="errors.has('toHit')">{{ errors.first('toHit') }}</div>
			</div>

			<template v-if="spell.level > 0">
				<p>Select cast level</p>
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

			<button 
				:disabled="errors.items && errors.items.length > 0 || missingRequired"
				class="btn btn-block mt-3" 
				@click="roll(spell, selectedLevel, casterLevel, toHitModifier)"
			>
				Roll
			</button>
		</div>

		<template v-if="rolled">
				<h3><b>{{ spell.name }} ({{ selectedLevel }})</b></h3>
			<div class="" v-for="(action, i) in rolled.actions" :key="`action-${i}`">
				<h3 v-if="action.type === 'Spell Save'">
					{{ action.save }} saving throw
				</h3>
				<h3 v-else-if="action.toHit">
					<span class="gray-hover">To hit:</span>
					{{ action.toHit.total }}
				</h3>
				<h3 class="result" v-for="(roll, i) in action.rolls" :key="`roll-${i}`">
					<span class="gray-hover">Damage:</span>
					<b class="red"> {{ totalDamage(roll) }}</b> <i>{{ roll.subtype }}</i>
				</h3>
			</div>
			<pre>
				{{ rolled }}
			</pre>
		</template>

		<hr>

		<pre>
			{{ spell }}
		</pre>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { spells } from '@/mixins/spells.js';

	export default {
		name: 'Spell',
		mixins: [spells],
		props: [
		'data'
		],
		data() {
			return {
				spell: this.data,
				selectedLevel: this.data.level,
				casterLevel: undefined,
				toHitModifier: undefined,
				rolled: undefined
			}
		},
		computed: {
			duration() {
				const type = this.spell.duration_type;
				const n = this.spell.duration_n;
				const scale = this.spell.duration_scale;

				if(type === 'Concentration') {
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

				if(type === 'Ranged') {
					return `${range} feet`;
				}

				return type;
			},
			isToHit() {
				//Checks if there is an action with to hit.
				let toHit = false;

				for(let action of this.spell.actions) {
					if(action.type === 'Melee Weapon' || action.type === 'Ranged Weapon' || action.type === 'Spell Attack') {
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
				if(this.spell.level_scaling === 'Character Level' && this.casterLevel === undefined) {
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
				this.rolled = this.rollSpell(spell, selectedLevel, casterLevel, toHitModifier);
			},
			totalDamage(rolls) {
				let total = rolls.modifierRoll.total;

				if(rolls.scaledRoll) {
					total = total + rolls.scaledRoll.total;
				}

				return total;
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
				background-color: #191919;
				user-select: none;
				margin: 0 3px;

				&.selected {
					background-color: #2c97de;
					color: #fff; 
				}
				&.disabled {
					opacity: .4;
					cursor: not-allowed;
				}
			}
		}
	}
} 

</style>
