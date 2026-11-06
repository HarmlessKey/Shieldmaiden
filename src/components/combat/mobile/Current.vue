<template>
	<div id="current" v-if="current">
		<div class="bg-neutral-6 current">
			<div>Up now:</div>
			<BasicEntity :entity="current" />
			<a
				@click="
					setDrawer({
						show: true,
						type: 'combat/TargetInfo',
						data: { key: current.key },
					})
				"
			>
				<q-icon name="info" />
			</a>
		</div>
		<div
			class="saves bg-neutral-8"
			v-if="
				(current.entityType === 'player' || current.entityType === 'companion') &&
				current.curHp === 0 &&
				!current.stable &&
				!current.dead
			"
		>
			<DeathSaves :target="current" />
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import DeathSaves from "src/components/combat/DeathSaves.vue";

export default {
	name: "Current",
	components: {
		BasicEntity,
		DeathSaves,
	},
	props: ["current", "next", "settings"],
	data() {
		return {
			setShadow: 0,
		};
	},
	computed: {
		...mapGetters(["entities", "round", "turn", "targeted"]),
	},
	methods: {
		...mapActions(["setDrawer"]),
	},
};
</script>

<style lang="scss" scoped>
.current {
	display: grid;
	grid-template-columns: 70px 1fr 35px;
	line-height: 35px;
	padding: 10px;

	a {
		color: $neutral-2;
		line-height: 35px;
		width: 35px;
		text-align: right;
		height: 35px;
		font-size: 28px;

		.q-icon {
			vertical-align: -4px;
		}
	}
}
.saves {
	padding: 10px;
}
</style>
