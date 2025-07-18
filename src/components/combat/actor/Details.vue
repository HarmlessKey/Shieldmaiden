<template>
	<div class="actor-details">
		<button class="btn btn-sm bg-neutral-5">
			<hk-icon icon="fas fa-list-alt" />
		</button>
		<div class="actor-details__name">
			<Name :entity="actor" />
		</div>
		<div class="actor-details__filler" />
		<template v-if="target">
			<div v-for="ability of abilities" :key="ability">
				<hk-roll
					:roll="{
						d: 20,
						n: 1,
						m: calcMod(target[ability] || 10),
						title: 'Initiative roll',
						notify: true,
					}"
				>
					<span class="label">{{ ability?.substring(0, 3) }}</span>
					{{ target?.[ability] || 10 }}
				</hk-roll>
			</div>
			<div v-for="(stat, key) of stats" :key="key">
				<hk-icon :icon="stat.icon" />
				{{ displayStats(target)[key] }}
				<q-tooltip anchor="bottom middle" self="center middle">{{ stat.label }}</q-tooltip>
			</div>
		</template>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { abilities } from "src/utils/generalConstants";
import { displayStats } from "src/utils/entityFunctions";
import { general } from "src/mixins/general";
import Name from "../entities/Name.vue";

export default {
	name: "SelectActor",
	components: {
		Name,
	},
	mixins: [general],
	props: {
		actor: {
			type: Object,
			default: null,
		},
		outOfTurn: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			stats: {
				speed: {
					icon: "fas fa-running",
					label: "Walk Speed",
				},
				ac: {
					icon: "fas fa-shield",
					label: "Armor Class",
				},
			},
			abilities: abilities,
			displayStats,
		};
	},
	computed: {
		...mapGetters(["entities", "targeted"]),
		target() {
			return this.targeted.length === 1 ? this.entities?.[this.targeted?.[0]] : undefined;
		},
	},
	methods: {},
};
</script>

<style lang="scss" scoped>
.actor-details {
	display: flex;
	gap: 1px;
	height: 32px;
	line-height: 32px;

	.btn {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	> div {
		background-color: $neutral-6;
		padding: 0 10px;
		font-weight: bold;

		i {
			font-size: 18px;
			margin-right: 3px;
			color: $neutral-2;
		}
		.hk-roll {
			cursor: pointer;
			height: 32px;

			.label {
				text-transform: uppercase;
				color: $neutral-2;
				font-size: 12px;
			}
		}
		&:last-child {
			border-top-right-radius: $border-radius-small;
			border-bottom-right-radius: $border-radius-small;
		}
	}
	&__name {
		font-weight: bold;
		max-width: 235px;
		padding-right: 45px !important;
		flex-grow: 1;

		.truncate {
			min-width: 0;
		}
	}
	&__filler {
		flex-grow: 1;
	}
}
</style>
