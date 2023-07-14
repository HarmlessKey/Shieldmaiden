<template>
	<div v-if="broadcast.live && !campaign.sharing" class="full-height">
		<q-tabs
			v-model="tab"
			:dark="$store.getters.theme === 'dark'"
			indicator-color="transparent"
			inline-label
			outside-arrows
			mobile-arrows
			no-caps
		>
			<q-tab
				v-for="{ name, label, icon } in tabs"
				:name="name"
				:icon="icon"
				:label="label"
				:key="name"
			>
				<q-badge v-if="showBadge(name)" class="bg-red" floating> Active </q-badge>
			</q-tab>
		</q-tabs>
		<q-tab-panels v-model="tab" class="bg-transparent">
			<q-tab-panel name="background">
				<ValidationObserver v-slot="{ valid }">
					<hk-input
						v-model="background.image"
						label="Background image"
						name="Background image"
						rules="url"
						class="mb-2"
						clearable
						:disable="disableBackground('image')"
						@input="
							(value) => {
								if (!value) {
									$delete(background, 'image');
								}
							}
						"
					>
						<hk-icon slot="prepend" icon="fas fa-image" />
					</hk-input>
					<hk-input
						v-model="background.video"
						label="Background video"
						name="Background video"
						rules="url"
						class="mb-2"
						clearable
						:disable="disableBackground('video')"
						@input="
							(value) => {
								if (!value) {
									$delete(background, 'video');
								}
							}
						"
					>
						<hk-icon slot="prepend" icon="fas fa-video" />
					</hk-input>
					<hk-input
						v-model="background.youtube"
						label="Background Youtube video"
						name="Background youtube"
						rules="url"
						class="mb-2"
						clearable
						:disable="disableBackground('youtube')"
						@input="
							(value) => {
								if (!value) {
									$delete(background, 'youtube');
								}
							}
						"
					>
						<hk-icon slot="prepend" icon="fab fa-youtube" />
					</hk-input>
					<button class="btn bg-neutral-5 mr-2" @click="clearBackground">Clear</button>
					<button
						class="btn"
						@click="valid ? setBackground() : null"
						:disabled="isEmpty(background) || !valid"
					>
						Set
					</button>
				</ValidationObserver>
			</q-tab-panel>

			<q-tab-panel name="share">
				<ValidationObserver v-slot="{ valid }">
					<hk-input
						v-model="share.image"
						label="Share image"
						name="Share image"
						rules="url"
						class="mb-2"
						clearable
						:disable="disableShare('image')"
						@input="
							(value) => {
								if (!value) {
									$delete(share, 'image');
								}
							}
						"
					>
						<hk-icon slot="prepend" icon="fas fa-image" />
					</hk-input>
					<hk-input
						v-model="share.youtube"
						label="Share Youtube video"
						name="Share Youtube video"
						rules="url"
						class="mb-2"
						clearable
						:disable="disableShare('youtube')"
						@input="
							(value) => {
								if (!value) {
									$delete(share, 'youtube');
								}
							}
						"
					>
						<hk-icon slot="prepend" icon="fab fa-youtube" />
					</hk-input>
					<hk-input
						v-model="share.message"
						label="Share message"
						name="Share message"
						type="textarea"
						rules="max:1000"
						maxlength="1001"
						class="mb-2"
						clearable
						:disable="disableShare('message')"
						@input="
							(value) => {
								if (!value) {
									$delete(share, 'message');
								}
							}
						"
					/>
					<button
						class="btn btn-block"
						:disabled="isEmpty(share) || !valid"
						@click="valid ? startShare() : null"
					>
						Share
					</button>
				</ValidationObserver>
			</q-tab-panel>

			<q-tab-panel name="weather">
				<Weather v-model="weather" />
				<button class="btn bg-neutral-5 mr-2" @click="clearWeather">Clear</button>
				<button class="btn" :disabled="isEmpty(weather)" @click="setWeather">Set</button>
			</q-tab-panel>
		</q-tab-panels>
	</div>
	<Sharing v-else-if="broadcast.live && campaign.sharing" @stop="stopShare" />
	<div v-else class="not-live">
		<div class="pane__header">Live initiative</div>
		<div class="pane__content">
			<p>
				This panel gives options for the live initiative screen and is therefore only useful if you
				are broadcasting.
			</p>
			<div class="not-live__broadcast">
				<Broadcast :data="{ campaign_id: campaignId }" />
			</div>
		</div>
	</div>
</template>

<script>
import Weather from "src/components/encounters/Weather";
import Broadcast from "src/components/drawers/Broadcast.vue";
import Sharing from "./Sharing.vue";
import { mapGetters, mapActions } from "vuex";
import { isEmpty } from "lodash";

export default {
	name: "CampaignShare",
	props: {
		campaign: {
			type: Object,
		},
	},
	components: {
		Weather,
		Broadcast,
		Sharing,
	},
	data() {
		return {
			campaignId: this.$route.params.campid,
			isEmpty: isEmpty,
			tab: "background",
			tabs: [
				{
					name: "background",
					label: "Background",
					icon: "fas fa-image",
				},
				{
					name: "share",
					label: "Share",
					icon: "fas fa-share-alt",
				},
				{
					name: "weather",
					label: "Weather",
					icon: "fas fa-cloud-rain",
				},
			],
			share: {},
			weather: this.campaign.weather || {},
			background: this.campaign.temporary_background || {},
		};
	},
	computed: {
		...mapGetters(["broadcast"]),
	},
	methods: {
		...mapActions("campaigns", ["set_campaign_prop"]),
		showBadge(tab) {
			switch (tab) {
				case "background":
					return !!this.campaign.temporary_background;
				case "share":
					return !!this.campaign.sharing;
				case "weather":
					return !!this.campaign.weather;
			}
		},
		modifyYoutubeUrl(url) {
			url = url.replace("youtu.be", "youtube.com");
			url = url.replace("youtube.com", "youtube-nocookie.com");
			url = !url.match(/\/embed/)
				? url.replace("youtube-nocookie.com", "youtube-nocookie.com/embed")
				: url; // add embed
			url = url.replace(/(watch\?v=)(.*?)(&)/g, "$2$3"); // get the id and set it directly after the /
			url = url.replace(/\?.*/g, ""); // remove params from url
			return url.replace(/&.*/g, "");
		},
		disableShare(property) {
			return !isEmpty(this.share) && !Object.keys(this.share).includes(property);
		},
		disableBackground(property) {
			return !isEmpty(this.background) && !Object.keys(this.background).includes(property);
		},
		startShare() {
			if (this.share.youtube) {
				this.share.youtube = this.modifyYoutubeUrl(this.share.youtube);
			}
			this.set_campaign_prop({
				id: this.campaignId,
				property: "sharing",
				value: this.share,
			});
		},
		stopShare() {
			this.set_campaign_prop({
				id: this.campaignId,
				property: "sharing",
				value: null,
			});
		},
		setBackground() {
			if (this.background.youtube) {
				this.background.youtube = this.modifyYoutubeUrl(this.background.youtube);
			}
			this.set_campaign_prop({
				id: this.campaignId,
				property: "temporary_background",
				value: this.background,
			});
		},
		clearBackground() {
			this.set_campaign_prop({
				id: this.campaignId,
				property: "temporary_background",
				value: null,
			});
			this.background = {};
		},
		setWeather() {
			this.set_campaign_prop({
				id: this.campaignId,
				property: "weather",
				value: this.weather,
			});
		},
		clearWeather() {
			this.set_campaign_prop({
				id: this.campaignId,
				property: "weather",
				value: null,
			});
			this.weather = {};
		},
	},
};
</script>

<style lang="scss" scoped>
.q-tabs {
	background-color: $neutral-8;
	position: sticky;
	top: 0;
	z-index: 10;

	.q-tab {
		&--active {
			color: $blue;
		}
	}
}
.not-live {
	text-align: center;

	&__broadcast {
		padding: 10px;
	}
}
</style>
