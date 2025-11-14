<template>
	<button class="btn btn-clear">
		<i aria-hidden="true" class="fas fa-ellipsis-v" />
		<q-popup-proxy :dark="$store.getters.theme === 'dark'" :breakpoint="576">
			<q-list class="bg-neutral-8">
				<q-item>
					<q-item-section>
						<strong>{{ encounter.name }}</strong>
					</q-item-section>
				</q-item>
				<q-separator />
				<q-item
					v-if="!demo && !test"
					clickable
					v-close-popup
					@click="
						setDrawer({
							show: true,
							type: 'drawers/Broadcast',
							data: {
								campaign_id: campid,
								encounter_id: encid,
							},
						})
					"
				>
					<q-item-section avatar>
						<i
							aria-hidden="true"
							class="far fa-dot-circle"
							:class="{ red: broadcast.live === campid }"
						/>
					</q-item-section>
					<q-item-section>
						{{ broadcast.live !== campid ? "Go live" : "Stop broadcast" }}
					</q-item-section>
				</q-item>
				<q-item
					v-if="encounter.audio"
					clickable
					v-close-popup
					@click="open_audio_link(encounter.audio)"
				>
					<q-item-section avatar
						><q-icon
							:class="audio_icons[audio_link_type].icon"
							:style="`color:${audio_icons[audio_link_type].color};`"
						></q-icon
					></q-item-section>
					<q-item-section>Audio Link</q-item-section>
				</q-item>
				<q-item
					v-if="!demo"
					clickable
					v-close-popup
					@click="setDrawer({ show: true, type: 'settings/Encounter' })"
				>
					<q-item-section avatar><i aria-hidden="true" class="fas fa-cogs" /></q-item-section>
					<q-item-section>Settings</q-item-section>
				</q-item>
				<q-item
					v-if="!demo && !test"
					clickable
					v-close-popup
					@click="setDrawer({ show: true, type: 'settings/TrackEncounter' })"
				>
					<q-item-section avatar><i aria-hidden="true" class="fas fa-desktop" /></q-item-section>
					<q-item-section>Public initiative settings</q-item-section>
				</q-item>
				<q-item
					v-if="demo"
					clickable
					v-close-popup
					@click="$router.replace('/tools/encounter-builder/build-encounter')"
				>
					<q-item-section avatar><i aria-hidden="true" class="fas fa-hammer-war" /></q-item-section>
					<q-item-section>Build encounter</q-item-section>
				</q-item>
				<q-item v-if="demo" clickable v-close-popup @click="reset_demo()">
					<q-item-section avatar><i aria-hidden="true" class="far fa-sync-alt" /></q-item-section>
					<q-item-section>Reset encounter</q-item-section>
				</q-item>
				<q-item v-if="!test" clickable v-close-popup @click="confirmFinish()">
					<q-item-section avatar><i aria-hidden="true" class="fas fa-check" /></q-item-section>
					<q-item-section>Finish encounter</q-item-section>
				</q-item>
				<q-separator />
				<q-item clickable v-close-popup @click="$router.replace(leaveRoute)">
					<q-item-section avatar
						><i aria-hidden="true" class="fas fa-chevron-left"
					/></q-item-section>
					<q-item-section>Leave encounter</q-item-section>
				</q-item>
			</q-list>
		</q-popup-proxy>
	</button>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { audio } from "src/mixins/audio";

export default {
	name: "CombatTopMenu",
	components: {},
	mixins: [audio],
	data() {
		return {
			campid: this.$route.params.campid,
			encid: this.$route.params.encid,
		};
	},
	computed: {
		...mapGetters(["user", "encounter", "broadcast", "test", "demo"]),
		leaveRoute() {
			if (this.demo) {
				return "/demo";
			}
			if (this.test) {
				return `/content/campaigns/${this.$route.params.campid}/${this.$route.params.encid}`;
			}
			return `/content/campaigns/${this.$route.params.campid}`;
		},
	},
	methods: {
		...mapActions(["setDrawer", "reset_demo", "set_finished"]),
		confirmFinish() {
			this.$snotify.error("Are you sure you want to finish the encounter?", "Finish Encounter", {
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
			});
		},
		finish() {
			this.set_finished();
		},
	},
	watch: {},
};
</script>
