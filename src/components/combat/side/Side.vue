<template>
	<div class="side" @focus="$emit('focus')">
		<q-tabs
			v-model="tab"
			:dark="$store.getters.theme === 'dark'"
			indicator-color="transparent"
			outside-arrows
			mobile-arrows
			dense
			align="left"
		>
			<q-tab name="log" icon="fas fa fa-scroll-old" />
			<q-tab name="damage" icon="fas fa-swords" />
			<q-tab v-if="!demo && !test" name="inventory" icon="fas fa-treasure-chest" />
			<q-tab v-if="!demo && !test" name="requests" icon="fas fa-bell">
				<div
					class="notifications bg-red white animated zoomIn"
					v-if="requests && Object.keys(requests).length"
				>
					<div>{{ Object.keys(requests).length }}</div>
				</div>
			</q-tab>
		</q-tabs>
		<q-scroll-area dark :thumb-style="{ width: '5px' }">
			<q-tab-panels v-model="tab" class="bg-transparent">
				<q-tab-panel name="log">
					<Log />
				</q-tab-panel>
				<q-tab-panel name="damage">
					<Dmg />
				</q-tab-panel>
				<q-tab-panel v-if="!demo && !test" name="inventory">
					<Inventory />
				</q-tab-panel>
				<q-tab-panel v-if="!demo && !test" name="requests">
					<Requests />
				</q-tab-panel>
			</q-tab-panels>
		</q-scroll-area>
	</div>
</template>

<script>
import Dmg from "src/components/combat/side/Dmg.vue";
import Log from "src/components/combat/side/Log.vue";
import Requests from "src/components/combat/side/Requests.vue";
import Inventory from "src/components/slides/party/Inventory.vue";
import { mapGetters } from "vuex";

export default {
	name: "Side",
	components: {
		Dmg,
		Log,
		Requests,
		Inventory,
	},
	data() {
		return {
			tab: "log",
		};
	},
	computed: {
		...mapGetters(["encounter", "requests", "demo", "test"]),
	},
};
</script>

<style lang="scss" scoped>
.side {
	height: 100%;
}
.q-tabs {
	background: $neutral-8-transparent;
	.q-tab {
		padding-top: 10px;
		padding-bottom: 9px;
		position: relative;

		&.q-tab--active {
			background: $neutral-6-transparent;
			color: $blue;
		}
		.notifications {
			user-select: none;
			position: absolute;
			top: -5px;
			right: -25px;
			height: 20px;
			width: 20px;
			border-radius: 50%;

			div {
				position: absolute;
				width: inherit;
				height: inherit;
				line-height: 20px;
				text-align: center;
				font-size: 13px;
			}
		}
	}
}
.q-scrollarea {
	height: calc(100% - 30px);
	background: $neutral-6-transparent;
}

.tab-content {
	padding: 0 10px 15px 10px;
}
</style>
