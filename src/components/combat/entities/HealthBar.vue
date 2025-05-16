<template>
	<div class="health-bar">
		<div class="health-bar__main" :style="{ width: `${main}%` }">
			<div class="health-bar__main-current" :style="{ width: `${current}%` }" :class="mainColor" />
			<div
				v-if="entity.maxHpMod"
				class="health-bar__main-modifier"
				:class="{ negative: entity.maxHpMod < 0 }"
				:style="{ width: `${modifier}%` }"
			>
				<q-tooltip anchor="top middle" self="center middle"
					>Max HP {{ entity.maxHpMod > 0 ? `+${entity.maxHpMod}` : entity.maxHpMod }}</q-tooltip
				>
			</div>
		</div>
		<div v-if="entity.tempHp" class="health-bar__temporary" :style="{ width: `${temporary}%` }">
			<q-tooltip anchor="top middle" self="center middle">Temp HP {{ entity.tempHp }}</q-tooltip>
		</div>
	</div>
</template>

<script>
import { displayStats } from "src/utils/entityFunctions";

export default {
	name: "HealthBar",
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			displayStats,
		};
	},
	computed: {
		max() {
			return this.entity.maxHp + (this.entity.maxHpMod || 0);
		},
		current() {
			return (this.entity.curHp / this.entity.maxHp) * 100;
		},
		modifier() {
			return (Math.abs(this.entity.maxHpMod) / this.entity.maxHp) * 100;
		},
		temporary() {
			return (this.entity.tempHp / this.max) * 100;
		},
		main() {
			return 100 - (this.temporary || 0);
		},
		mainColor() {
			switch (true) {
				case this.current <= 25:
					return "bg-red";
				case this.current <= 50:
					return "bg-orange";
				default:
					return "bg-green";
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.health-bar {
	width: 100%;
	display: flex;
	text-align: center;
	font-size: 12px;
	background-color: $neutral-9;
	border-radius: 999px;
	align-items: center;

	&__main {
		width: 100%;
		position: relative;
		background-color: $neutral-9;
		border-radius: 999px;
		overflow: hidden;
		border: solid 4px $neutral-9;
		height: 6px;
		box-sizing: content-box;
		align-items: center;

		> div {
			height: 100%;
		}
		&-current {
			transition: all 0.5s linear;
		}
		&-modifier {
			position: absolute;
			right: 0;
			top: 0;
			background-color: $neutral-1;
			opacity: 0.4;

			&.negative {
				background-color: $neutral-6;
				opacity: 1;
			}
		}
	}
	&__temporary {
		height: 6px;
		box-sizing: content-box;
		border: solid 3px $neutral-9;
		background-color: $neutral-2;
		border-radius: 999px;
		transition: transform 0.5s linear;
		margin-left: -4px;
		z-index: 10;
	}
}
</style>
