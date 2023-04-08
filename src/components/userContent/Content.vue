<template>
	<q-list class="mt-3">
		<q-item
			v-for="{ type, icon } in content_types"
			:class="{ overenc: content_count[type] > tier.benefits[type] }"
			:to="`/content/${type}`"
			:key="type"
		>
			<q-linear-progress
				size="46px"
				:value="content_count[type] / tier.benefits[type]"
				color="neutral-9"
				track-color="neutral-10"
			/>
			<q-item-section avatar>
				<i aria-hidden="true" class="fas neutral-2" :class="icon" />
			</q-item-section>
			<q-item-section>
				{{ type.capitalize() }}
			</q-item-section>
			<q-item-section side>
				<div class="neutral-2">
					<span class="green count">
						{{ content_count[type] }}
					</span>
					<span> / </span>
					<i aria-hidden="true" v-if="tier.benefits[type] === 'infinite'" class="far fa-infinity" />
					<span v-else>{{ tier.benefits[type] }}</span>
				</div>
			</q-item-section>
		</q-item>
	</q-list>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	name: "Content",
	data() {
		return {
			content_types: [
				{
					type: "campaigns",
					icon: "fa-dungeon",
				},
				{
					type: "players",
					icon: "fa-user",
				},
				{
					type: "npcs",
					icon: "fa-dragon",
				},
				{
					type: "spells",
					icon: "fa-wand-magic",
				},
				{
					type: "reminders",
					icon: "fa-stopwatch",
				},
				{
					type: "items",
					icon: "fa-staff",
				},
			],
		};
	},
	computed: {
		...mapGetters(["tier", "content_count"]),
	},
};
</script>

<style lang="scss" scoped>
.q-item {
	background: none;
	margin-bottom: 1px;
	z-index: 1;

	&.overenc {
		border: solid 1px $red;
		.fas {
			color: $red !important;
		}
		.count {
			color: $red !important;
		}
	}
	.q-linear-progress {
		position: absolute;
		left: 0;
		top: 0;
		z-index: -1;
	}
}
</style>
