<template>
	<div class="health-bar">
		<div class="health-bar__main" :style="{ width: `${main}%` }">
			<div class="health-bar__main-current" :style="{ width: `${current}%` }"></div>
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
export default {
	name: "HealthBar",
	props: {
		entity: {
			type: Object,
			required: true,
		},
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
	},
};
</script>

<style lang="scss" scoped>
.health-bar {
	width: 100%;
	// overflow: hidden;
	display: flex;
	gap: 2px;
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
		border: solid 3px $neutral-9;
		height: 8px;
		box-sizing: content-box;
		align-items: center;

		> div {
			height: 100%;
		}
		&-current {
			background-color: $neutral-4;
		}
		&-modifier {
			position: absolute;
			right: 0;
			top: 0;
			border-left: solid 2px $neutral-2;

			&.negative {
				background-color: $neutral-5;
				outline: none;
				border-color: $neutral-9;
			}
		}
	}
	&__temporary {
		height: 10px;
		box-sizing: content-box;
		border: solid 3px $neutral-9;
		background-color: $neutral-2;
		border-radius: 999px;
	}
}
</style>
