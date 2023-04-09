<template>
	<div v-if="!loading" class="spell">
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
			<hk-roll-action
				:action="spell"
				type="spell"
				:attack-bonus="attack_bonus"
				:cast-level="cast_level"
				:caster-level="caster_level"
			>
				<button class="btn btn-block mt-3">Roll</button>
			</hk-roll-action>
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
	},
	data() {
		return {
			spell: {},
			loading: true,
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
	},
	async beforeMount() {
		if (this.data) {
			this.spell = this.data;
			this.loading = false;
		} else {
			this.spell = await this.fetch_api_spell(this.id);
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
