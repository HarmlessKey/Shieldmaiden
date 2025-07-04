<template>
	<q-no-ssr v-if="!loading && encounter_initialized" v-shortkey="['d']" @shortkey="focusDamage">
		<div v-if="overencumbered && !demo">
			<OverEncumbered />
		</div>
		<div
			v-else-if="encounter && (players || demo)"
			class="combat-wrapper"
			:style="[
				settings.background && getBackground(encounter)
					? { background: 'url(\'' + getBackground(encounter) + '\')' }
					: { background: '' },
			]"
			v-shortkey="{
				left: [','],
				right: ['.'],
				clearSnotify: ['esc'],
			}"
			@shortkey="cyclePanes"
		>
			<template v-if="encounter.finished">
				<Finished v-if="!demo" :encounter="encounter" />
				<DemoFinished v-else />
			</template>
			<!-- DESKTOP -->
			<template v-else-if="width > 576">
				<template v-if="encounter.finished">
					<Finished v-if="!demo" :encounter="encounter" />
					<DemoFinished v-else />
				</template>

				<template v-else>
					<SetInitiative
						v-if="encounter.round === 0"
						:_active="_active"
						:_idle="_idle"
						:width="width"
					/>
					<div v-else-if="!settings.layout" class="desktop">
						<Top
							:_active="_active"
							:current="_active[encounter.turn]"
							:next="_active[encounter.turn + 1]"
							:settings="settings"
						/>
						<Pane title="Actor">
							<ViewEntity :data="actor || _active[encounter.turn]" current />
						</Pane>
						<Targets
							ref="targets"
							tabindex="0"
							class="pane"
							:current="_active[encounter.turn]"
							:_active="_active"
							:_idle="_idle"
							:class="{ focused: focused_pane === 'targets' }"
							@focus="focusPane('targets')"
						/>
						<Targeted
							ref="targeted"
							tabindex="0"
							class="pane"
							:class="{ focused: focused_pane === 'targeted' }"
							@focus="focusPane('targeted')"
						/>
						<Side
							ref="side"
							tabindex="0"
							class="pane"
							:class="{ focused: focused_pane === 'side' }"
							@focus="focusPane('side')"
						/>
					</div>
					<div v-else class="legacy">
						<Turns
							:active_len="Object.keys(_active).length"
							:current="_active[encounter.turn]"
							:next="_active[encounter.turn + 1]"
							:settings="settings"
						/>
						<Current
							ref="current"
							tabindex="0"
							class="pane"
							:current="_active[encounter.turn]"
							:next="next"
							:settings="settings"
							:class="{ focused: focused_pane === 'current' }"
							@focus="focusPane('current')"
						/>
						<Targets
							ref="targets"
							tabindex="0"
							class="pane"
							:current="_active[encounter.turn]"
							:_active="_active"
							:_idle="_idle"
							:class="{ focused: focused_pane === 'targets' }"
							@focus="focusPane('targets')"
						/>
						<Targeted
							ref="targeted"
							tabindex="0"
							class="pane"
							out-of-turn-actions
							:class="{ focused: focused_pane === 'targeted' }"
							@focus="focusPane('targeted')"
						/>
						<Side
							ref="side"
							tabindex="0"
							class="pane legacy-side"
							:class="{ focused: focused_pane === 'side' }"
							log
							@focus="focusPane('side')"
						/>
					</div>
				</template>
			</template>

			<!-- MOBILE -->
			<template v-else>
				<SetInitiative
					v-if="encounter.round === 0"
					:_active="_active"
					:_idle="_idle"
					:width="width"
				/>
				<div v-else class="mobile">
					<Turns
						:active_len="Object.keys(_active).length"
						:current="_active[encounter.turn]"
						:next="_active[encounter.turn + 1]"
						:settings="settings"
					/>

					<CurrentMobile :current="_active[encounter.turn]" :next="next" :settings="settings" />

					<Targets :_active="_active" :_idle="_idle" />

					<div>
						<Menu :entities="entities" :settings="settings" :current="_active[encounter.turn]" />
					</div>
				</div>
			</template>
		</div>
		<DemoOverlay v-if="demo" />
		<TutorialFinishedDialog v-if="demo" />
		<q-dialog v-model="demo_dialog" persistent>
			<hk-card header="Create custom content">
				<div class="card-body text-center">
					<h2>This is our demo encounter.</h2>
					<p>When signed in you can create Campaigns and run your custom Encounters from there.</p>
					<router-link to="/content/campaigns" class="btn bg-green btn-block mb-2">
						Go to campaigns
					</router-link>
					<button class="btn btn-sm btn-block btn-clear" @click="demo_dialog = false">
						Continue demo
					</button>
				</div>
			</hk-card>
		</q-dialog>
		<q-resize-observer @resize="setSize" />
	</q-no-ssr>
	<q-no-ssr v-else class="combat-wrapper">
		<hk-loader name="encounter" />
		<q-resize-observer @resize="setSize" />
	</q-no-ssr>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from "vuex";
import { audio } from "src/mixins/audio";
import Finished from "src/components/combat/Finished.vue";
import DemoFinished from "src/components/combat/DemoFinished.vue";
import Top from "src/components/combat/top";
import Turns from "src/components/combat/legacy/Turns.vue";
import Menu from "src/components/combat/mobile/Menu.vue";
import Current from "src/components/combat/legacy/Current.vue";
import CurrentMobile from "src/components/combat/mobile/Current.vue";
import Targets from "src/components/combat/Targets.vue";
import Targeted from "src/components/combat/Targeted.vue";
import Side from "src/components/combat/side/Side.vue";
import SetInitiative from "src/components/combat/initiative";
import OverEncumbered from "src/components/userContent/OverEncumbered.vue";
import DemoOverlay from "src/components/combat/DemoOverlay.vue";
import TutorialFinishedDialog from "src/components/combat/TutorialFinishedDialog.vue";
import ViewEntity from "src/components/combat/ViewEntity.vue";
import Pane from "src/components/combat/Pane.vue";

export default {
	name: "RunEncounter",
	components: {
		Finished,
		DemoFinished,
		Top,
		Turns,
		Menu,
		Current,
		CurrentMobile,
		Targets,
		Targeted,
		Side,
		SetInitiative,
		OverEncumbered,
		DemoOverlay,
		TutorialFinishedDialog,
		ViewEntity,
		Pane,
	},
	mixins: [audio],
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			demo: this.$route.name === "Demo",
			test: this.$route.name === "TestEncounter",
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			target: undefined,
			width: 0,
			audio_notification: false,
			loading: true,
			demo_dialog: false,
			panes: ["current", "targets", "targeted", "side"],
			focused_pane: null,
		};
	},
	beforeMount() {
		if (!this.demo && !this.test && this.broadcast.live === this.campaignId) {
			this.setLiveEncounter(this.encounterId);
		}
	},
	async mounted() {
		if (!this.demo) {
			await this.get_campaign({ uid: this.userId, id: this.campaignId });
			await this.get_encounter({
				uid: this.userId,
				campaignId: this.campaignId,
				id: this.encounterId,
			});
		} else {
			this.demo_dialog = !!this.userId;
		}
		await this.init_Encounter({
			cid: this.campaignId,
			eid: this.encounterId,
			demo: this.demo,
			test: this.test,
		});
		this.loading = false;
	},
	computed: {
		...mapGetters([
			"user",
			"encounter",
			"campaigns",
			"entities",
			"encounter_initialized",
			"overencumbered",
			"broadcast",
			"requests",
			"userSettings",
			"actor",
		]),
		...mapGetters("players", ["players"]),
		...mapGetters("encounters", ["demo_encounter"]),
		settings() {
			return this.userSettings && this.userSettings.encounter ? this.userSettings.encounter : {};
		},
		_active: function () {
			let order = this.settings && this.settings.initOrder ? "asc" : "desc";

			return _.chain(this.entities)
				.filter(function (entity, key) {
					entity.key = key;
					return entity.active && !entity.down;
				})
				.orderBy(function (entity) {
					return entity.name;
				}, "asc")
				.orderBy(function (entity) {
					return Number(entity.initiative);
				}, order)
				.value();
		},
		_idle: function () {
			let order = this.settings && this.settings.initOrder ? "asc" : "desc";

			return _.chain(this.entities)
				.filter(function (entity, key) {
					entity.key = key;
					return !entity.active && !entity.down;
				})
				.orderBy(function (entity) {
					return Number(entity.initiative);
				}, order)
				.value();
		},
		alive() {
			return Object.keys(this._alive).length;
		},
		_alive: function () {
			let order = this.settings && this.settings.initOrder ? "asc" : "desc";

			return _.chain(this.entities)
				.filter(function (entity, key) {
					entity.key = key;
					return (
						entity.active && entity.curHp > 0 && entity.entityType == "npc" && !entity.friendly
					);
				})
				.orderBy(function (entity) {
					return parseInt(entity.initiative);
				}, order)
				.value();
		},
		next() {
			//returns next in initiative order
			//returns first if there is no next
			return this._active[this.encounter.turn + 1] || this._active[0];
		},
	},
	watch: {
		alive(newVal) {
			if (newVal === 0 && this.encounter_initialized) {
				this.confirmFinish();
			}
		},
		encounter: {
			deep: true,
			handler(newValue) {
				// Create notify if encounter has audio link
				if (
					newValue !== undefined &&
					newValue.audio !== undefined &&
					this.audio_notification === false
				) {
					this.audio_notification = true;
					this.$q.notify({
						message: "Audio link found",
						caption: "Would you like to follow it?",
						color: "blue-light",
						position: "top",
						progress: true,
						timeout: 7500,
						icon: this.audio_icons[this.audio_link_type].icon,
						actions: [
							{
								label: "Yes",
								color: "white",
								handler: () => {
									this.open_audio_link(this.encounter.audio);
								},
							},
							{
								label: "No",
								color: "white",
								handler: () => {
									/* ... */
								},
							},
						],
					});
				}
			},
		},
		requests: {
			deep: true,
			handler(newValue, oldValue) {
				if (newValue && oldValue && Object.keys(newValue).length > Object.keys(oldValue).length) {
					this.$snotify.warning("A new player request was made.", "New request", {
						timeout: 5000,
						buttons: [
							{
								text: "Show requests",
								action: (toast) => {
									this.setDrawer({ show: true, type: "combat/side/Requests" });
									this.$snotify.remove(toast.id);
								},
								bold: false,
							},
							{
								text: "Close",
								action: (toast) => {
									this.$snotify.remove(toast.id);
								},
								bold: false,
							},
						],
					});
				}
			},
		},
	},
	beforeRouteLeave(_to, _from, next) {
		this.reset_store();
		this.setLiveEncounter();
		next();
	},
	beforeRouteUpdate(_to, _from, next) {
		this.reset_store();
		this.setLiveEncounter();
		next();
	},
	methods: {
		...mapActions([
			"init_Encounter",
			"set_finished",
			"reset_store",
			"setDrawer",
			"setLiveEncounter",
		]),
		...mapActions("campaigns", ["get_campaign"]),
		...mapActions("encounters", ["get_encounter"]),
		setSize(size) {
			this.width = size.width;
		},
		confirmFinish() {
			this.$snotify.error(
				"All NPCs seem to be dead. Do you want to finish the encounter?",
				"Finish Encounter",
				{
					position: "centerCenter",
					timeout: 0,
					buttons: [
						{
							text: "Finish",
							action: (toast) => {
								this.finish();
								this.$snotify.remove(toast.id);
							},
							bold: false,
						},
						{
							text: "Cancel",
							action: (toast) => {
								this.$snotify.remove(toast.id);
							},
							bold: true,
						},
					],
				}
			);
		},
		finish() {
			this.set_finished();
		},
		getBackground(encounter) {
			if (encounter.background) return encounter.background;
			if (encounter.hk_background)
				return require(`src/assets/_img/atmosphere/${encounter.hk_background}.jpg`);
			return undefined;
		},
		focusDamage() {
			const pane = this.$refs.current?.$el;
			this.focused_pane = "current";

			// Focus on the manual input
			if (pane.querySelector('[name="Manual Input"]')) {
				pane.querySelector('[name="Manual Input"]')?.focus();
			}
			// Focus on the first ability/spell
			else if (pane.getElementsByClassName("q-item")) {
				pane.getElementsByClassName("q-item")?.[0]?.focus();
			} else {
				pane?.focus();
			}
		},
		focusPane(name) {
			const pane = this.$refs?.[name]?.$el;
			this.focused_pane = name;

			switch (name) {
				case "current":
				case "side":
					pane.getElementsByClassName("q-tab")?.[0]?.focus();
					break;
				case "targets":
					pane.getElementsByClassName("target-li")?.[0]?.focus();
					break;
				case "targeted":
					pane.getElementsByClassName("option")?.[0]?.focus();
					break;
				default:
					pane.focus();
			}
		},
		cyclePanes(e) {
			const key = e.srcKey;
			const current = this.focused_pane ? this.panes.indexOf(this.focused_pane) : -1;
			let index;

			// Clear notifications
			if (key === "clearSnotify") {
				this.$snotify.clear();
			} else {
				if (key === "right") {
					index = current < this.panes.length - 1 ? current + 1 : 0;
				} else {
					index = current > 0 ? current - 1 : this.panes.length - 1;
				}
				const name = this.panes[index];
				this.focusPane(name);
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.combat-wrapper {
	background-size: cover !important;
	background-position: center bottom !important;
	background-color: $neutral-10;
	height: calc(100vh - 50px);

	.finished {
		margin-top: 30px;
		background: rgba(38, 38, 38, 0.9) !important;
	}
	.desktop {
		width: 100%;
		height: 100%;
		padding: 5px;
		display: grid;
		grid-template-columns: repeat(3, 1fr) 300px;
		grid-template-rows: min-content 1fr;
		grid-gap: 5px;
		grid-template-areas:
			"top top top top"
			"actor targets targeted side";
		position: absolute;

		.actor {
			grid-area: actor;
		}
	}
	.legacy {
		padding: 5px;
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: 3fr 4fr 3fr 2fr;
		grid-template-rows: 60px 1fr;
		grid-gap: 5px;
		grid-template-areas:
			"turns turns turns turns"
			"current targets targeted side";
		position: absolute;
		font-size: 12px;
		h1 {
			text-transform: uppercase;
			font-size: 15px !important;
		}
		h2 {
			text-transform: uppercase;
			font-size: 15px !important;
			margin-bottom: 20px !important;
		}
		h3 {
			font-size: 15px !important;
			margin-bottom: 15px !important;
		}
	}

	.pane {
		border-radius: $border-radius;
		&.focused,
		&:focus {
			outline: $neutral-3 solid 1px;
			outline-offset: 1px;
		}
	}

	.side {
		grid-area: side;
		overflow: hidden;
	}

	.mobile {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 60px max-content 1fr 60px;
		grid-template-areas:
			"turns"
			"current"
			"targets"
			"menu";

		#turns {
			border-bottom: solid 1px $neutral-9;
		}
		#current {
			z-index: 90;
		}
	}

	@media only screen and (max-width: 1000px) {
		.legacy {
			grid-template-columns: 2fr 3fr 2fr;
			grid-template-areas:
				"turns turns turns"
				"current targets targeted";

			.legacy-side {
				display: none;
			}
		}
	}
	@media only screen and (max-width: 900px) {
		.legacy {
			grid-template-columns: 1fr 1fr;
			grid-template-areas:
				"turns turns"
				"current targets";
		}
	}
}
</style>
