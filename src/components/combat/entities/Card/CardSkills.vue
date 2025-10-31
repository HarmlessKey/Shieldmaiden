<template>
	<div class="card-skills">
		<hk-roll
			v-for="(skill, key) in skills"
			:key="key"
			:roll="{
				d: 20,
				n: 1,
				m: skillModifier(skill),
				title: `${skill.skill} check`,
				entity_name: entity.name.capitalizeEach(),
				notify: true,
			}"
			:share="
				shares.includes('skill_rolls')
					? {
							encounter_id: encounterId,
							entity_key: entity.key,
						}
					: null
			"
		>
			<span class="card-skills__skill">
				<div class="expertise">
					<template v-if="entity.skills && entity.skills.includes(key)">
						<i
							aria-hidden="true"
							v-if="entity.skills_expertise && entity.skills_expertise.includes(key)"
							class="far fa-dot-circle"
						></i>
						<i aria-hidden="true" v-else class="fas fa-circle"></i>
					</template>
					<i aria-hidden="true" v-else class="far fa-circle"></i>
				</div>
				<span class="truncate">
					{{ skill.skill }}
				</span>
				<span class="modifier">{{ skillModifier(skill) }}</span>
			</span>
		</hk-roll>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { skills } from "src/utils/generalConstants";

export default {
	name: "CardSkills",
	props: {
		entity: {
			type: Object,
			required: true,
		},
		skillModifier: {
			type: Function,
		},
	},
	data() {
		return {
			skills,
		};
	},
	computed: {
		...mapGetters(["encounterId", "broadcast"]),
		shares() {
			return this.broadcast.shares || [];
		},
	},
};
</script>

<style lang="scss" scoped>
.card-skills {
	user-select: none;
	column-count: 2;
	column-gap: 10px;
	margin-bottom: 15px;

	.hk-roll {
		width: 100%;
	}
	&__skill {
		display: flex;
		gap: 1px;
		cursor: pointer;
		width: 100%;
		text-align: left;
		margin-bottom: 1px;
		line-height: 28px;

		.expertise {
			padding: 0 3px;
			background-color: $neutral-5;
			border-bottom-left-radius: $border-radius;
			border-top-left-radius: $border-radius;

			i {
				&.fa-circle {
					margin: 0 3px;
					font-size: 8px;
					vertical-align: 2px;
				}
			}
		}
		.truncate {
			background-color: $neutral-5;
			padding: 0 5px;
			min-width: 0;
			flex-grow: 1;
		}
		.modifier {
			text-align: center;
			min-width: 28px;
			background-color: $neutral-5;
			border-bottom-right-radius: $border-radius;
			border-top-right-radius: $border-radius;
		}
		&:hover {
			.expertise,
			.truncate,
			.modifier {
				background-color: $neutral-4;
			}
		}
	}
	.advantage .card-skills__skill:hover {
		color: $green;
	}
	.disadvantage .card-skills__skill:hover {
		color: $red;
	}
}
</style>
