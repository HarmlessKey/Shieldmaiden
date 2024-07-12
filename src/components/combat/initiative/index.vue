<template>
	<div
		v-if="width > 576"
		id="container"
		v-shortkey="{
			left: [','],
			right: ['.'],
		}"
		@shortkey="cyclePanes"
	>
		<Turns :next="_active[0]" />
		<div
			ref="players"
			tabindex="0"
			class="pane players"
			:class="{ focused: focused_pane === 'players' }"
			@focus="focusPane('players')"
		>
			<h2 class="componentHeader" :class="{ shadow: setShadowPlayer > 0 }">
				<span><i aria-hidden="true" class="fas fa-helmet-battle"></i> Players</span>
			</h2>
			<q-scroll-area
				:dark="$store.getters.theme === 'dark'"
				:thumb-style="{ width: '5px' }"
				v-on:scroll="shadow()"
				ref="scrollPlayer"
			>
				<Players :players="_players" class="p-3" />
			</q-scroll-area>
		</div>
		<div
			ref="npcs"
			tabindex="0"
			class="pane npcs"
			:class="{ focused: focused_pane === 'npcs' }"
			@focus="focusPane('npcs')"
		>
			<h2 class="componentHeader" :class="{ shadow: setShadowNPC > 0 }">
				<span><i aria-hidden="true" class="fas fa-dragon"></i> NPC's</span>
			</h2>
			<q-scroll-area
				:dark="$store.getters.theme === 'dark'"
				:thumb-style="{ width: '5px' }"
				v-on:scroll="shadow()"
				ref="scrollNPC"
			>
				<NPCs :npcs="_npcs" class="p-3" />
			</q-scroll-area>
		</div>
		<div
			ref="overview"
			tabindex="0"
			class="pane set"
			:class="{ focused: focused_pane === 'overview' }"
			@focus="focusPane('overview')"
		>
			<h2 class="componentHeader" :class="{ shadow: setShadowOverview > 0 }">
				<span>Active entities</span>
			</h2>
			<q-scroll-area
				:dark="$store.getters.theme === 'dark'"
				:thumb-style="{ width: '5px' }"
				v-on:scroll="shadow()"
				ref="scrollOverview"
			>
				<Overview :active="_active" :idle="_idle" class="p-3" />
			</q-scroll-area>
		</div>
	</div>

	<!-- MOBILE -->
	<div v-else class="mobile-init">
		<Turns />

		<div class="menu bg-neutral-8">
			<q-select
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				v-model="panel"
				:options="panels"
			>
				<template v-slot:selected>
					<q-item>
						<q-item-section avatar>
							<q-icon
								:name="
									panels.filter((item) => {
										return item.value === panel;
									})[0].icon
								"
							/>
						</q-item-section>
						<q-item-section>
							<q-item-label
								v-text="
									panels.filter((item) => {
										return item.value === panel;
									})[0].label
								"
							/>
						</q-item-section>
					</q-item>
				</template>
				<template v-slot:option="scope">
					<q-item
						clickable
						v-ripple
						v-close-popup
						:active="panel === scope.opt.value"
						@click="panel = scope.opt.value"
					>
						<q-item-section avatar>
							<q-icon :name="scope.opt.icon" />
						</q-item-section>
						<q-item-section>
							<q-item-label v-text="scope.opt.label" />
						</q-item-section>
					</q-item>
				</template>
			</q-select>
		</div>

		<q-tab-panels v-model="panel" animated swipeable infinite class="bg-neutral-6-transparent">
			<q-tab-panel name="players">
				<h2>Players</h2>
				<Players :players="_players" />
			</q-tab-panel>
			<q-tab-panel name="npcs">
				<h2>NPC's</h2>
				<NPCs :npcs="_npcs" />
			</q-tab-panel>
			<q-tab-panel name="overview">
				<a class="btn btn-block mb-3" @click="set_turn({ turn: 0, round: 1 })">
					Start encounter
					<TutorialPopover v-if="demo" tutorial="initiative" step="start" :offset="[0, 10]" />
				</a>
				<Overview :active="_active" :idle="_idle" />
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from "vuex";

import Turns from "src/components/combat/Turns.vue";
import Players from "./Players.vue";
import NPCs from "./NPCs.vue";
import Overview from "./Overview.vue";
import TutorialPopover from "src/components/demo/TutorialPopover.vue";

export default {
	name: "SetInitiative",
	props: ["_active", "_idle", "width"],
	components: {
		Turns,
		Players,
		NPCs,
		Overview,
		TutorialPopover,
	},
	data() {
		return {
			demo: this.$route.name === "Demo",
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			setShadowPlayer: 0,
			setShadowNPC: 0,
			setShadowOverview: 0,
			panes: ["players", "npcs", "overview"],
			focused_pane: "players",
			panel: "players",
			panels: [
				{
					label: "Players initiative",
					value: "players",
					icon: "fas fa-helmet-battle",
				},
				{
					label: "NPC's initiative",
					value: "npcs",
					icon: "fas fa-dragon",
				},
				{
					label: "Overview",
					value: "overview",
					icon: "fas fa-list-ul",
				},
			],
		};
	},
	computed: {
		...mapGetters(["campaignId", "encounterId", "encounter", "entities", "path"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		_players: function () {
			return _.chain(this.entities)
				.filter(function (entity, key) {
					entity.key = key;
					return entity.entityType == "player" || entity.entityType == "companion";
				})
				.sortBy("name", "desc")
				.value();
		},
		_npcs: function () {
			return _.chain(this.entities)
				.filter(function (entity, key) {
					entity.key = key;
					return entity.entityType == "npc";
				})
				.sortBy("name", "desc")
				.value();
		},
	},
	methods: {
		...mapActions(["set_turn"]),
		cyclePanes(e) {
			const key = e.srcKey;
			const current = this.focused_pane ? this.panes.indexOf(this.focused_pane) : -1;
			let index;
			if (key === "right") {
				index = current < this.panes.length - 1 ? current + 1 : 0;
			} else {
				index = current > 0 ? current - 1 : this.panes.length - 1;
			}
			const name = this.panes[index];
			this.focusPane(name);
		},
		focusPane(name) {
			const pane = this.$refs?.[name];
			this.focused_pane = name;

			switch (name) {
				case "npcs":
					pane.getElementsByClassName("roll-all")?.[0]?.focus();
					break;
				case "overview":
					pane.getElementsByClassName("entity")?.[0]?.focus();
					break;
				default:
					pane.focus();
			}
		},
		shadow() {
			this.setShadowPlayer = this.$refs.scrollPlayer.scrollPosition;
			this.setShadowNPC = this.$refs.scrollNPC.scrollPosition;
			this.setShadowOverview = this.$refs.scrollOverview.scrollPosition;
		},
		switchTab(direction) {
			if (this.panel === "players") {
				this.panel = direction === "next" ? "npcs" : "players";
			} else if (this.panel === "npcs") {
				this.panel = direction === "next" ? "overview" : "players";
			} else if (this.panel === "overview") {
				this.panel = direction === "previous" ? "npcs" : "overview";
			}
		},
	},
};
</script>

<style lang="scss" scoped>
#container {
	padding: 5px;
	width: 100vw;
	height: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 60px auto;
	grid-gap: 5px;
	grid-template-areas:
		"turns turns turns"
		"players npcs set";
	position: absolute;

	.q-scrollarea {
		height: calc(100% - 45px);
	}

	h2 {
		padding-left: 10px;

		&.componentHeader {
			padding: 10px 15px !important;
			margin-bottom: 0 !important;
			background-color: $neutral-8-transparent;

			&.shadow {
				box-shadow: 0 0 10px rgba(0, 0, 0, 0.9);
			}
		}
	}
	.pane {
		background: $neutral-6-transparent;
		overflow: hidden;

		&.players {
			grid-area: players;
		}
		&.npcs {
			grid-area: npcs;
		}
		&.set {
			grid-area: set;
		}
		&.focused,
		&:focus {
			outline: $neutral-3 solid 1px;
			outline-offset: 1px;
		}
	}
}
.initiative-move {
	transition: transform 0.5s;
}
@media only screen and (max-width: 900px) {
	#container {
		grid-template-columns: auto;
		grid-template-rows: 60px 1fr 1fr 1fr;
		grid-gap: 10px;
		grid-template-areas:
			"turns"
			"players"
			"npcs"
			"set";
	}
}

.mobile-init {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 60px 60px 1fr;
	height: calc(100vh - 50px);
	grid-template-areas:
		"turns"
		"menu"
		"overview";

	.top {
		display: flex;
		justify-content: space-between;
		line-height: 60px;
		padding: 0 15px;

		.left {
			display: flex;
			justify-content: flex-start;
			align-items: center;
		}

		a {
			font-size: 25px;
		}
		.menu {
			grid-area: menu;
		}
	}
}
</style>
