<template>
	<div class="spell">
		<div class="spell__title">
			<h3>
				{{ spell.name }} <span class="source neutral-2">{{ spell.source }}</span>
			</h3>
			<i>
				<template v-if="spell.level === 0">Cantrip </template>
				<template v-else>{{ spell.level | numeral("0o") }}-level </template>
				{{ spell.school }}
			</i>
		</div>

		<div class="spell__info">
			<b>Casting time:</b> {{ spell.cast_time }} {{ spell.cast_time_type }}<br />
			<b>Range:</b> {{ range }}<br />
			<template v-if="spell.ritual"> <b>Ritual:</b> Yes<br /> </template>
			<template v-if="spell.components">
				<b>Components:</b>
				{{ spell.components.map((comp) => comp.charAt(0).toUpperCase()).join(", ") }}
				{{ spell.material_description ? `(${spell.material_description})` : "" }}
			</template>
			<br />
			<b>Duration:</b> {{ duration }}<br />
			<template v-if="spell.classes">
				<b>Classes:</b>
				<template v-for="(_class, index) in spell.classes">
					{{ _class }}<template v-if="Object.keys(spell.classes).length > index + 1">, </template>
				</template>
			</template>
		</div>

		<div class="spell__description">
			<hk-markdown-editor :value="spell.description" read-only />
			<div v-if="spell.higher_level">
				<strong class="pl-2"><em>At Higher Levels.</em></strong> {{ spell.higher_level }}
			</div>
		</div>

		<div class="actions" v-if="spell.actions">
			<h4 class="mb-3">Roll spell</h4>

			<q-input
				v-if="spell.scaling === 'character_level'"
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				class="mb-3"
				label="Caster level"
				type="number"
				v-model="caster_level"
			/>

			<!-- TO HIT MODIFIER INPUT -->
			<q-input
				v-if="isToHit"
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				class="mb-3"
				label="Spell attack"
				type="text"
				v-model="attack_bonus"
			/>

			<!-- SPELL LEVEL INPUT -->
			<template v-if="spell.level > 0">
				<p>Select Casting level</p>
				<div class="actions__levels">
					<div
						class="level"
						:class="{
							selected: cast_level === i,
							disabled: i < spell.level,
						}"
						v-for="i in 9"
						:key="i"
						@click="spell.level <= i ? selectLevel(i) : null"
					>
						{{ i }}
					</div>
				</div>
			</template>

			<!-- ROLL SPELL -->
			<hk-roll @roll="roll($event)">
				<button class="btn btn-block mt-3">Roll</button>
			</hk-roll>
		</div>
	</div>
</template>

<script>
import { damage_types } from "src/utils/generalConstants";
import { mapActions } from "vuex";
import { dice } from "src/mixins/dice.js";

export default {
	name: "ViewSpell",
	props: ["data", "no_roll"],
	mixins: [dice],
	data() {
		return {
			damage_types: damage_types,
			spell: this.data,
			cast_level: this.data.level,
			caster_level: undefined,
			attack_bonus: undefined,
		};
	},
	computed: {
		duration() {
			const type = this.spell.duration_type;
			const n = this.spell.duration_n;
			const scale = this.spell.duration_scale;

			if (type === "concentration") {
				let dur_scale = n === 1 ? scale : scale + "s";
				return `Concentration, up to ${n} ${dur_scale}`;
			}
			if (type === "Time") {
				let dur_scale = n === 1 ? scale : scale + "s";
				return `${n} ${dur_scale}`;
			}
			return type;
		},
		range() {
			const type = this.spell.range_type;
			const range = this.spell.range;

			if (type === "ranged") {
				return `${range} feet`;
			}

			return type;
		},
		isToHit() {
			//Checks if there is an action with to hit.
			let toHit = false;

			for (let action of this.spell.actions) {
				if (
					action.type === "melee_weapon" ||
					action.type === "ranged_weapon" ||
					action.type === "spell_attack"
				) {
					toHit = true;
				}
			}
			return toHit;
		},
	},
	methods: {
		...mapActions(["setActionRoll"]),
		selectLevel(i) {
			this.cast_level = i;
		},
		roll(e) {
			const action = {
				action_list: this.spell.actions,
				name: this.spell.name,
				scaling: this.spell.scaling,
				level: this.spell.level,
			};

			const config = {
				type: "spell",
				attack_bonus: this.attack_bonus,
				cast_level: this.cast_level,
				caster_level: this.caster_level,
			};

			this.setActionRoll(this.rollAction(e, action, config));
		},
	},
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
			background-color: $green;
		}
	}
	.disadvantage {
		.btn {
			background-color: $red;
		}
	}
	.actions {
		margin-bottom: 15px;

		&__levels {
			display: flex;
			justify-content: center;
			margin: 0 -5px;

			.level {
				width: 30px;
				height: 30px;
				line-height: 30px;
				text-align: center;
				cursor: pointer;
				background-color: $neutral-6;
				user-select: none;
				margin: 0 3px;

				&.selected {
					background-color: $blue;
					color: $neutral-1;
				}
				&.disabled {
					opacity: 0.4;
					cursor: not-allowed;
				}
			}
		}
	}
}
</style>
