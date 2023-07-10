<template>
	<div ref="track" class="track">
		<template v-if="campaign">
			<template v-if="!campaign.private">
				<!-- NOT LIVE -->
				<div class="track-wrapper" v-if="!encounter || !isLive">
					<div class="top">
						<router-link class="btn btn-sm btn-clear" :to="`/user/${userId}`">
							<i aria-hidden="true" class="fas fa-chevron-left"></i> Back
						</router-link>
						<span class="title written truncate">{{ campaign.name }}</span>
						<div class="d-flex justify-content-end items-center gap-2">
							<span class="live" :class="{ active: broadcasting['.value'] == campaignId }"
								>live</span
							>
							<a v-if="show_mute" aria-label="Toggle sound" class="mute" @click="muted = !muted">
								<i aria-hidden="true" v-if="muted" class="fas fa-volume-mute neutral-3" />
								<i aria-hidden="true" v-else class="fas fa-volume" />
							</a>
							<a
								v-if="!isEmpty(campaign.weather) && isLive"
								aria-label="Toggle weather effects"
								class="weather"
								@click="show_weather = !show_weather"
							>
								<i aria-hidden="true" v-if="show_weather" class="fas fa-cloud-showers" />
								<i aria-hidden="true" v-else class="fas fa-cloud hide" />
							</a>
							<a @click="toggleFullscreen" class="full">
								<q-icon :name="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'" />
								<q-tooltip anchor="bottom middle" self="top middle">Fullscreen</q-tooltip>
							</a>
						</div>
					</div>
					<div
						class="campaign"
						:style="{
							backgroundImage: getBackground(campaign)
								? 'url(\'' + getBackground(campaign) + '\')'
								: '',
						}"
					>
						<CampaignOverview
							:players="players"
							:campaign="campaign"
							:width="width"
							:shares="shares"
							:show-weather="show_weather"
							:live="isLive"
							:muted="muted"
						/>
					</div>
				</div>

				<!-- LIVE -->
				<Live
					v-else-if="encounter && isLive"
					:encounter="encounter"
					:campaign="campaign"
					:players="players"
					:width="width"
					:shares="shares"
				/>
			</template>
			<div v-else>
				<div class="top d-flex justify-content-between">
					<router-link class="btn btn-sm btn-clear" :to="`/user/${$route.params.userid}`">
						<i aria-hidden="true" class="fas fa-chevron-left"></i> Back
					</router-link>
					Not found
				</div>
				<div class="container-fluid">
					<div class="container entities">
						<h2>Perception check failed</h2>
						<p>
							It seems we rolled a little low, this campaign can't be found.<br />
							It is possible the campaign is set to private.
						</p>
					</div>
				</div>
			</div>
		</template>

		<transition-group
			tag="div"
			enter-active-class="animated animate__fadeInUp"
			leave-active-class="animated animate__fadeOutUp"
			class="xp-wrapper"
		>
			<div
				v-for="(xp, index) in xpAward"
				class="xp"
				:key="`xp-${index}`"
				@click="$delete(xpAward, index)"
			>
				{{ xp > 0 ? `+${xp}` : xp }}<small>xp</small>
			</div>
		</transition-group>
	</div>
</template>

<script>
import _ from "lodash";
import { db } from "src/firebase";
import CampaignOverview from "src/components/trackCampaign/CampaignOverview.vue";
import Live from "./live";

export default {
	name: "TrackCampaign",
	components: {
		CampaignOverview,
		Live,
	},
	data() {
		return {
			user: this.$store.getters.user,
			userId: this.$route.params.userid,
			campaignId: this.$route.params.campid,
			encounter: undefined,
			campaign: undefined,
			tier: undefined,
			width: 0,
			shares: [],
			xpAward: [],
			isEmpty: _.isEmpty,
			show_weather: true,
			muted: false,
		};
	},
	firebase() {
		return {
			players: {
				source: db.ref(`players/${this.userId}`),
				asObject: true,
			},
			broadcasting: {
				source: db.ref(`broadcast/${this.userId}/live`),
				asObject: true,
			},
		};
	},
	computed: {
		shared() {
			return this.campaign && this.broadcasting[".value"] ? this.campaign.shares : {};
		},
		isLive() {
			return this.broadcasting[".value"] === this.campaignId;
		},
		show_mute() {
			return (
				this.campaign.temporary_background &&
				this.isLive &&
				(this.campaign.temporary_background.video || this.campaign.temporary_background.youtube)
			);
		},
	},
	watch: {
		shared(share, oldShare) {
			//Check if the roll has not been shown before
			if ((share && !oldShare) || (share && share.key !== oldShare.key)) {
				if (!this.checkShare(share.key)) {
					const notification = share.notification;

					// Rolls
					if (share.type === "roll") {
						let advantage;
						if (notification.advantage_disadvantage) {
							const color = notification.advantage_disadvantage === "a" ? "green" : "red";
							advantage = `<b class="${color}">${notification.advantage_disadvantage.capitalize()}</b>`;
						}

						this.$snotify.html(
							`<div class="snotifyToast__body roll">
									<div class="roll_title truncate">${
										notification.entity_name ? `${notification.entity_name}: ` : ``
									}${notification.title}</div>
									<div class="rolled" id="roll">${notification.total}</div>
									<div class="roll_footer">${advantage ? advantage : ""}${notification.roll}</div>
								</div> `,
							{
								timeout: 8000,
								closeOnClick: true,
							}
						);
					}

					// XP gains
					if (share.type === "xp") {
						this.xpAward.push(notification.amount);

						this.debounceXpRemove();
					}
					this.shares.unshift(share);
				}
			}
		},
	},
	beforeMount() {
		this.fetch_encounter();
	},
	mounted() {
		this.$nextTick(function () {
			window.addEventListener("resize", this.setSize);
			//Init
			this.setSize();
		});
	},
	methods: {
		debounceXpRemove: _.debounce(function () {
			this.xpAward = this.xpAward.slice(1);
		}, 3000),
		setSize() {
			this.width = this.$refs.track.clientWidth;
		},
		fetch_encounter() {
			var track = db.ref(`broadcast/${this.userId}`);
			track.on("value", (snapshot) => {
				let campId = this.campaignId;

				if (snapshot.val()) {
					let encId = snapshot.val().encounter;

					let encounter = db.ref(`encounters/${this.userId}/${campId}/${encId}`);

					encounter.on("value", (result) => {
						let enc = result.val();
						if (enc) {
							enc.key = encId;
						}
						this.encounter = enc;
					});
				}
				//Get campaign for player curHP/tempHP/ACBonus/Dead/Stable/DeathSaves
				let fetchCampaign = db.ref(`campaigns/${this.userId}/${campId}`);

				fetchCampaign.on("value", (result) => {
					this.campaign = result.val();
				});
			});
		},
		toggleFullscreen(e) {
			const target = e.target.parentNode.parentNode.parentNode.parentNode;

			this.$q.fullscreen.toggle(target).catch((err) => {
				alert(err);
			});
		},
		checkShare(key) {
			return !!this.shares.filter((item) => {
				return item.key === key;
			})[0];
		},
		getBackground(object) {
			if (object && object.background) return object.background;
			if (object && object.hk_background)
				return require(`src/assets/_img/atmosphere/${object.hk_background}.jpg`);
			return undefined;
		},
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.setSize);
	},
};
</script>

<style lang="scss" scoped>
.track {
	background-color: $neutral-5;
	.track-wrapper {
		height: calc(100vh - 50px);
		background-size: cover;
		background-position: bottom center;
		width: 100vw;
		position: relative;

		.top {
			grid-area: top;
			background: $neutral-8;
			height: 60px;
			line-height: 30px;
			padding: 15px 10px;
			display: grid;
			grid-template-columns: max-content auto max-content;

			.title {
				text-align: center;
				padding: 0 10px;
				font-size: 20px;
				line-height: 33px;
				text-transform: none;
			}
			.full,
			.mute,
			.weather {
				font-size: 25px;
				color: $neutral-2;
			}
			.weather .hide {
				font-size: 19px;
				vertical-align: 7px;
				opacity: 0.5;
			}
			.full i {
				vertical-align: -2px;
			}
		}
		.campaign {
			height: calc(100% - 60px);
			background-size: cover;
			background-position: bottom center;
		}
	}
	.xp-wrapper {
		.xp {
			position: absolute;
			top: 33%;
			width: 100%;
			text-align: center;
			font-size: 100px;
			color: $neutral-1;
			font-weight: bold;
			text-shadow: 0 0 5px $black;
			letter-spacing: -2px;
			z-index: 2;
			user-select: none;

			.shadow {
				width: 100%;
				position: absolute;
				top: 0;
				text-shadow: 2px 2px 5px $black;
				color: transparent;
				z-index: -1;
			}
		}
	}
}
</style>
