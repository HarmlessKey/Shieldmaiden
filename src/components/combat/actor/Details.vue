<template>
	<div class="actor-details">
		<button class="btn btn-sm bg-neutral-5">
			<hk-icon icon="fas fa-list-alt" />
		</button>
		<div class="actor-details__name">
			<div class="truncate">
				{{ actor.name?.capitalizeEach() }}
			</div>
		</div>
		<template v-for="(stat, key) of stats">
			<div :key="key">
				<hk-icon :icon="stat.icon" />
				{{ displayStats(actor)[key] }}
				<q-tooltip anchor="bottom middle" self="center middle">{{ stat.label }}</q-tooltip>
			</div>
		</template>
		<template v-for="ability of abilities">
			<div v-if="actor[ability]" :key="ability">
				<hk-roll
					:roll="{
						d: 20,
						n: 1,
						m: calcMod(actor[ability]),
						title: 'Initiative roll',
						notify: true,
					}"
				>
					<span class="label">{{ ability?.substring(0, 3) }}</span>
					{{ actor[ability] }}
				</hk-roll>
			</div>
		</template>
		<!-- <div class="actor-details__filler" /> -->
		<!-- <pre>{{ actor }}</pre> -->
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { abilities } from "src/utils/generalConstants";
import { displayStats } from "src/utils/entityFunctions";
import { general } from "src/mixins/general";

export default {
	name: "SelectActor",
	components: {},
	mixins: [general],
	props: {
		actor: {
			type: Object,
		},
		outOfTurn: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			stats: {
				ac: {
					icon: "fas fa-shield",
					label: "Armor Class",
				},
				speed: {
					icon: "fas fa-running",
					label: "Walk Speed",
				},
			},
			abilities: abilities,
			displayStats,
		};
	},
	computed: {
		...mapGetters([]),
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
