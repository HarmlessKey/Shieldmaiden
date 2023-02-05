<template>
	<div>
		<h3>Character Sync</h3>
		<div v-if="browser !== 'Chrome'" class="red mb-2">
			Google
			<a
				href="https://chrome.google.com"
				target="_blank"
				rel="noopener"
			>Chrome</a>
			is needed for this feature to work.
		</div>
		<template v-if="!hasExtension">
			<p>
				A Google Chrome Extension is needed to Sync your characters from other resources.
			</p>
			<a
				class="btn btn-block"
				href="https://chrome.google.com/webstore/detail/dd-character-sync/jgcbbmbchbkdjbgiiheminkkkecjohpg"
				target="_blank"
				rel="noopener"
			>
				Install D&D Character Sync
			</a>
		</template>
		<q-stepper
			v-else
			:dark="$store.getters.theme === 'dark'"
			v-model="step"
			vertical
			animated
		>
			<q-step
				v-for="({ title, description, icon }, i) in steps"
				:name="i"
				:title="title"
				:icon="icon"
				:active-icon="icon"
				done-icon="fas fa-check white"
				done-color="positive"
				:done="step > i"
				:key="`step-${i}`"
			>
				<div v-html="description" />

				<div v-if="i === 0" class="extension-icon" />

				<q-stepper-navigation>
					<q-btn v-if="step > 0" label="Previous" no-caps @click="previous" class="mr-1" />
					<q-btn color="primary" label="Next" no-caps @click="next" v-if="step < steps.length - 1" />
				</q-stepper-navigation>
			</q-step>
		</q-stepper>
		<template v-if="tier.name === 'Free'">
			<hr>
			<p>This feature is only available with a subscription.</p>
			<router-link to="/patreon" class="btn btn-block bg-patreon-red">Get a subscription</router-link>
		</template>
	</div>
</template>

<script>
	import { extensionInstalled } from "src/utils/generalFunctions";
	import { browserDetect } from 'src/functions';
	import { mapGetters } from "vuex";

	export default {
		name: 'CharacterSync',
		data() {
    	return {
				hasExtension: false,
				browser: browserDetect(),
				step: 0,
				steps: [
					{
						title: "Store Characters",
						description: "First store at least one character in the <strong>D&D Character Sync</strong> extension.<br/>"+
							"Open the extension and follow the steps to sync. With the extension you can save any character you want, also those of your players.",
						icon: "fas fa-download"
					},
					{
						title: "Link a Character",
						description: "<p>Link a Character from the extension to a Player in Harmless Key.<br/>"+
							'If you now revisit your player overview, there are <button class="btn btn-sm bg-neutral-5"><i class="fas fa-link" aria-hidden="true"></i></button> '+
							'buttons next to each player to link a character with <span class="neutral-3">*</span>.</p>'+
							'<small class="neutral-3">* Only if you have a Harmless Key subscription</small>',
						icon: "fas fa-link"
					},
					{
						title: "Sync Character",
						description: "<p>Now that you linked a character to your player, you can sync the stats from the extension "+
						'to Harmless Key with one click on the <button class="btn btn-sm bg-neutral-5"><i class="fas fa-sync-alt" aria-hidden="true"></i></button> button.</p>'+
						"Every time changes are made to the original character sheet, it has to be revisited to update it in the extension, then the Sync button in Harmless Key must be used to update the player again.",
						icon: "fas fa-sync-alt"
					}
				]
			}
		},
		computed: {
			...mapGetters(["tier"]),
		},
		methods: {
			previous() {
				this.step--;
			},
			next() {
				this.step++;
			}
		},
		async mounted() {
			this.hasExtension = await extensionInstalled();
		}
	};
</script>

<style lang="scss" scoped>
	.q-stepper {
		border: none;
		padding: 0;
	}
	.extension-icon {
		border-radius: 25px;
		margin-top: 15px;
		height: 50px;
		width: 165px;
		background-size: contain;
		background-repeat: no-repeat;
		background-image: url("../../assets/_img/CharacterSyncExtensionIcon.webp");
	}
</style>
