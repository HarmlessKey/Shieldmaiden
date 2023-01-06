<template>
	<q-stepper
		:dark="$store.getters.theme === 'dark'"
		class="mb-3"
		v-model="step"
		:vertical="vertical"
		animated
	>
		<q-step
			v-for="({ title, text, icon, to }, i) in steps"
			:name="i"
			:title="title"
			:icon="icon"
			:active-icon="icon"
			done-icon="fas fa-check white"
			done-color="positive"
			:done="step > i"
			:key="`step-${i}`"
		>
			<div v-html="text" />
			<q-stepper-navigation v-if="to && to !== $route.path">
				<q-btn :to="to" color="primary" label="Start" no-caps />
			</q-stepper-navigation>
		</q-step>
	</q-stepper>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";

	export default {
		name: "UserTutorial",
		props: {
			vertical: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				no_players: true,
				steps: [
					{
						title: "Create campaign",
						text: "First create a campaign to group your party and encounters under.",
						icon: "fas fa-dungeon white",
						to: "/content/campaigns"
					},
					{
						title: "Create players",
						text: "Create characters for the players in your party.",
						icon: "fas fa-users white",
						to: "/content/players"
					},
					{
						title: "Add players to campaign",
						text: "Add your newly created players to your campaign.<br/>"+
							'Got the campaign overview and click on the <button class="btn btn-sm btn-clear"><i class="fas fa-user-plus"></i></button> button in your campaign.',
						icon: "fas fa-user-plus white",
						to: "/content/campaigns"
					},
					{
						title: "Create encounter",
						text: "Create the first encounter for your campaign.<br/>"+
							'Go the campaign overview and click on <button class="btn btn-sm btn-clear"><i class="fas fa-swords"></i> Add encounters</button> '+
							"on your campaign.",
						icon: "fas fa-swords white",
						to: "/content/campaigns"
					},
				]
			}
		},
		async mounted() {
			await this.get_campaigns();
			for(const campaign of this.campaigns) {
				if(!campaign.player_count) {
					this.no_players = true;
					return;
				}
				this.no_players = false;
			}
		},
		computed: {
			...mapGetters(["content_count"]),
			...mapGetters("campaigns", ["campaign_count", "campaigns"]),
			step() {
				if(!this.content_count.campaigns) {
					return 0;
				}
				if(!this.content_count.players) {
					return 1;
				}
				if(this.no_players) {
					return 2;
				}
				if(!this.content_count.encounters){
					return 3;
				}
				return 5;
			}
		},
		methods: {
			...mapActions("campaigns", ["get_campaigns"])
		},
		watch: {
			campaigns: {
				deep: true,
				handler(newVal) {
					for(const campaign of newVal) {
						if(campaign.player_count) {
							this.no_players = false;
							return;
						}
						this.no_players = true;
					}
				}
			}
		}
	}
</script>
