<template>
	<div class="hk-xp-bar" :style="{ height: `${height}px`, lineHeight: `${height}px` }">
		<div v-if="height >= 15" class="hk-xp-bar__level" :style="{ width: `${height}px` }">
			{{ calculatedLevel(xp) }}
		</div>
		<q-linear-progress :size="`${height}px`" :value="levelAdvancement(xp)" :color="color">
			<div class="absolute-full d-flex justify-between">
				<q-separator color="neutral-5" vertical v-for="i in 11" :key="i" />
			</div>
			<div class="absolute-full flex flex-center" v-if="height >= 15">
				<div class="value neutral-1 text-shadow-3">
					<hk-animated-integer :value="levelProgress(xp)" /> /
					{{ levelRequired(xp) }}
					({{ Math.floor(levelAdvancement(xp) * 100) }}%)
				</div>
			</div>
		</q-linear-progress>
		<div
			v-if="height >= 15 && calculatedLevel(xp) < 20"
			class="hk-xp-bar__level"
			:style="{ width: `${height}px` }"
		>
			{{ calculatedLevel(xp) + 1 }}
		</div>
	</div>
</template>

<script>
import { experience } from "src/mixins/experience.js";

export default {
	name: "hk-xp-bar",
	mixins: [experience],
	props: {
		xp: {
			type: Number,
			default: 0,
		},
		height: {
			type: Number,
			default: 15,
		},
		color: {
			type: String,
			default: "primary",
		},
	},
};
</script>

<style lang="scss" scoped>
.hk-xp-bar {
	display: flex;
	justify-content: space-between;

	&__level {
		text-align: center;

		// &:first-child {
		// 	padding-right: 10px;
		// }
		// &:last-child {
		// 	padding-left: 10px;
		// }
	}

	.q-linear-progress {
		.value {
			font-size: 12px;
		}
	}
}
</style>
