<template>
	<div class="side" :class="{ 'is-drawer': drawer }" @focus="$emit('focus')">
		<q-tabs
			v-model="tab"
			:dark="$store.getters.theme === 'dark'"
			indicator-color="transparent"
			outside-arrows
			mobile-arrows
			dense
			align="left"
		>
			<q-tab name="log" v-if="log" icon="fas fa fa-scroll-old" />
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
				<q-tab-panel v-if="log" name="log">
					<Log />
				</q-tab-panel>
				<q-tab-panel name="damage">
					<DamageMeters />
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
import DamageMeters from "src/components/combat/side/DamageMeters.vue";
import Log from "src/components/combat/legacy/side/Log.vue";
import Requests from "src/components/combat/side/Requests.vue";
import Inventory from "src/components/drawers/party/Inventory.vue";
import { mapGetters } from "vuex";

export default {
	name: "Side",
	components: {
		DamageMeters,
		Log,
		Requests,
		Inventory,
	},
	props: {
		log: {
			type: Boolean,
			default: false,
		},
		drawer: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			tab: this.log ? "log" : "damage",
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

	&.is-drawer {
		height: calc(100vh - 120px);

		.q-scrollarea {
			background: none;
			height: calc(100% - 50px);
		}
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
	.q-tab-panel {
		padding: 10px;
	}
	.q-scrollarea {
		position: relative;
		height: calc(100% - 30px);
		max-width: 100%;
		background: $neutral-6-transparent;

		// Position relative on scrollarea__content causes target items to overflow horizontally
		&::v-deep {
			.q-scrollarea__content {
				position: unset;
			}
		}
	}
}
</style>
