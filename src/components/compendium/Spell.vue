<template>
	<div v-if="!loading" class="spell">
		<template v-if="spell.actions && $route.name !== 'RunEncounter'">
			<button class="btn bg-neutral-5 btn-block mb-2" @click="show_roll_input = !show_roll_input">
				Roll
			</button>
			<q-slide-transition>
				<div v-if="show_roll_input" class="roll">
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
						<strong>Select Casting level</strong>
						<div class="caster__levels">
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
					<hk-roll-action
						:action="spell"
						type="spell"
						:attack-bonus="attack_bonus"
						:cast-level="cast_level"
						:caster-level="caster_level"
					>
						<button class="btn btn-block">Roll</button>
					</hk-roll-action>
				</div>
			</q-slide-transition>
		</template>
		<div class="spell__title">
			<h3>
				{{ spell.name.capitalizeEach() }} <span class="source neutral-2">{{ spell.source }}</span>
			</h3>
			<i>
				<template v-if="spell.level === 0">Cantrip </template>
				<template v-else>{{ spell.level | numeral("0o") }}-level </template>
				{{ spell.school.capitalize() }}
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
					{{ _class.capitalize()
					}}<template v-if="Object.keys(spell.classes).length > index + 1">, </template>
				</template>
			</template>
		</div>

		<div class="spell__description">
			<hk-markdown-editor :value="spell.description" read-only />
			<div v-if="spell.higher_level">
				<strong class="pl-2"><em>At Higher Levels.</em></strong> {{ spell.higher_level }}
			</div>
		</div>
	</div>
	<hk-loader v-else name="spell" />
</template>

<script>
import { mapActions } from "vuex";

export default {
	name: "Spell",
	props: {
		// If the spell is fetched in a parent component you can send the full spell object in de data prop
		data: {
			type: Object,
		},
		// If the id prop is passed, the spell is fetched in the Spell component
		id: {
			type: String,
		},
		custom: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			spell: {},
			show_roll_input: false,
			loading: true,
			cast_level: undefined,
			caster_level: undefined,
			attack_bonus: undefined,
		};
	},
	computed: {
		duration() {
			const type = this.spell.duration_type;
			const n = this.spell.duration;
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
	async beforeMount() {
		if (this.data) {
			this.spell = this.data;
			this.cast_level = this.data.level;
			this.loading = false;
		} else {
			this.spell = this.custom
				? await this.get_spell({ uid: this.userId, id: this.id })
				: await this.fetch_api_spell(this.id);
			this.cast_level = this.spell.level;
			this.loading = false;
		}
	},
	methods: {
		...mapActions("api_spells", ["fetch_api_spell"]),
		selectLevel(i) {
			this.cast_level = i;
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
}

.roll {
	width: 100%;
	padding: 10px;
	border-radius: 5px;
	background-color: $neutral-6;
	.caster__levels {
		display: flex;
		justify-content: center;
		column-gap: 3px;
		margin: 10px 0;

		.level {
			width: 30px;
			height: 30px;
			line-height: 30px;
			text-align: center;
			cursor: pointer;
			background-color: $neutral-8;
			user-select: none;

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
</style>
