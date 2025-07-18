<template>
	<div class="card-details">
		<BasicEntity :entity="full_entity" class="mb-1">
			<small v-if="entity.source" class="neutral-2">{{ entity.source }}</small>
		</BasicEntity>
		<small v-if="full_entity.entityType !== 'player'">
			<em>
				<template v-if="full_entity.size">{{ full_entity.size }}</template>
				<template v-if="full_entity.type"> {{ full_entity.type }}</template>
				<span v-if="full_entity.subtype">({{ full_entity.subtype }})</span>
				<template v-if="full_entity.alignment">, {{ full_entity.alignment }}</template>
			</em>
		</small>
		<hr />
		<div class="card-details__abilities">
			<template v-for="(ability, index) in abilities">
				<div v-if="index === 0 || index === 3" :key="index" class="card-details__abilities-header">
					<div class="placeholder" />
					<div>mod</div>
					<div>save</div>
				</div>
				<div :key="ability" class="ability">
					<div class="ability__label">{{ ability.substring(0, 3).toUpperCase() }}</div>
					<div class="ability__score">{{ full_entity[ability] }}</div>
					<hk-roll
						v-for="type in ['mod', 'save']"
						:key="type"
						class="pointer"
						:class="`ability__${type}`"
						:roll="{
							d: 20,
							n: 1,
							m: modifier(ability, type),
							title: `${ability.capitalize()} check`,
							entity_name: full_entity.name.capitalizeEach(),
							notify: true,
						}"
						:share="
							shares.includes('ability_rolls')
								? {
										encounter_id: encounterId,
										entity_key: full_entity.key,
									}
								: null
						"
					>
						{{
							modifier(ability, type) > 0 ? `+${modifier(ability, type)}` : modifier(ability, type)
						}}
					</hk-roll>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import BasicEntity from "../BasicEntity.vue";
import { abilities, skills } from "src/utils/generalConstants";
import { calc_mod } from "src/utils/generalFunctions";
import { monsterMixin } from "src/mixins/monster.js";
import { experience } from "src/mixins/experience";

export default {
	name: "CardDetails",
	mixins: [monsterMixin, experience],
	components: {
		BasicEntity,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			abilities: abilities,
			skillList: skills,
			calc_mod: calc_mod,
		};
	},
	computed: {
		...mapGetters(["broadcast", "targeted"]),
		shares() {
			return this.broadcast.shares || [];
		},
		full_entity() {
			let entity = JSON.parse(JSON.stringify(this.entity));
			if (entity.entityType === "npc" && !entity.no_linked_npc && !entity.proficiency) {
				entity.proficiency = this.monster_challenge_rating[entity.challenge_rating].proficiency;
			}
			return entity;
		},
	},
	methods: {
		savingThrow(ability) {
			let proficiency;
			if (this.full_entity.entityType === "player") {
				proficiency = this.returnProficiency(
					this.full_entity.level
						? this.full_entity.level
						: this.calculatedLevel(this.full_entity.experience)
				);
			} else {
				proficiency = this.full_entity.proficiency;
			}
			return this.full_entity.saving_throws && this.full_entity.saving_throws.includes(ability)
				? parseInt(calc_mod(this.full_entity[ability] || 10)) + proficiency
				: parseInt(calc_mod(this.full_entity[ability] || 10));
		},
		modifier(ability, type) {
			return type === "mod" ? calc_mod(this.full_entity[ability] || 10) : this.savingThrow(ability);
		},
	},
};
</script>

<style lang="scss" scoped>
.card-details {
	hr {
		background-color: $neutral-5;
	}
	&__abilities {
		columns: 2;

		&-header {
			display: flex;
			justify-content: space-evenly;

			&:before {
				content: "";
				display: block;
				width: 100%;
			}
			> div {
				width: 100%;
				text-align: center;
				font-size: 13px;

				&.placeholder {
					column-span: 2;
				}
			}
		}
		.ability {
			display: flex;
			justify-content: space-evenly;
			gap: 1px;
			line-height: 30px;
			margin-bottom: 3px;

			> div,
			> button {
				width: 100%;
				background-color: $neutral-5;
			}
			button {
				transition: all 0.2s linear;
				&:hover {
					background-color: $neutral-4;
				}
			}
			&__label {
				padding-left: 5px;
				border-bottom-left-radius: $border-radius;
				border-top-left-radius: $border-radius;
			}
			&__score {
				text-align: center;
			}
			&__save {
				border-bottom-right-radius: $border-radius;
				border-top-right-radius: $border-radius;
			}
		}
	}
}
</style>
