<template>
	<div>
		<h2>Award Experience</h2>
		<q-input
			:dark="$store.getters.theme === 'dark'"
			filled
			square
			label="Amount"
			class="text-center mb-3"
			type="number"
			v-model="amount"
		/>

		<h3 class="mt-3">Award experience to:</h3>
		<div v-for="(player, key) in players" :key="key">
			<q-checkbox :dark="$store.getters.theme === 'dark'" v-model="awardTo" :val="key">
				{{ player.character_name }}
				<span v-if="amount && awardTo.includes(key)" class="ml-2 blue">
					({{ ((awardPlayer() &lt; 0) ? "" : "+") + awardPlayer() }})
				</span>
			</q-checkbox>
		</div>

		<q-btn-toggle
			v-model="awardType"
			spread
			no-caps
			class="mt-4"
			:dark="$store.getters.theme === 'dark'"
			:options="options"
			toggle-color="green"
		/>

		<button class="btn btn-block my-3" @click="awardXP()">Award XP</button>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	props: {
		data: {
			type: Object,
			default: function () {
				return {
					amount: undefined,
					entities: undefined,
				};
			},
		},
	},
	data() {
		return {
			user: this.$store.getters.user,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			amount: this.data.amount,
			awardXp: this.data.entities,
			campaign: {},
			allPlayers: [],
			players: {},
			allSelected: true,
			indeterminate: false,
			options: [
				{ label: "Divide over", value: "divide" },
				{ label: "Award to all", value: "toAll" },
			],
			awardType: "divide",
		};
	},
	computed: {
		...mapGetters(["broadcast"]),
		share() {
			return (this.broadcast.shares && this.broadcast.shares.includes("xp")) || false;
		},
		awardTo: {
			get() {
				return this.awardXp ? this.awardXp : this.allPlayers;
			},
			set(newValue) {
				this.awardXp = newValue;
				return newValue;
			},
		},
	},
	async mounted() {
		await this.get_campaign({
			uid: this.user.uid,
			id: this.campaignId,
		}).then(async (campaign) => {
			this.campaign = campaign;

			for (const id in campaign.players) {
				this.allPlayers.push(id);
				this.$set(this.players, id, await this.get_player({ uid: this.user.uid, id }));
			}
		});
	},
	watch: {
		awardTo(newVal) {
			// Handle changes in individual player checkboxes
			if (newVal.length === 0) {
				this.indeterminate = false;
				this.allSelected = false;
			} else if (newVal.length === this.allPlayers.length) {
				this.indeterminate = false;
				this.allSelected = true;
			} else {
				this.indeterminate = true;
				this.allSelected = false;
			}
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("campaigns", ["get_campaign", "set_share"]),
		...mapActions("players", ["get_player", "set_player_prop"]),
		...mapActions("encounters", ["set_xp", "update_encounter_prop"]),
		awardPlayer() {
			let amount = this.amount;

			if (this.awardType === "divide") {
				amount = Math.floor(this.amount / this.awardTo.length);
			}
			return parseInt(amount);
		},
		awardXP() {
			let amount = parseInt(this.amount);

			if (this.awardType === "divide") {
				amount = Math.floor(this.amount / this.awardTo.length);
			}

			// Share
			if (this.share && amount !== 0) {
				const key = Date.now() + Math.random().toString(36).substring(4);
				const share = {
					key,
					type: "xp",
					notification: {
						amount,
						targets: this.awardTo,
					},
				};
				if (this.$route.name === "RunEncounter") share.encounter_id = this.encounterId;
				this.set_share({ id: this.broadcast.live, share });
			}

			// AWARD XP
			for (const key of this.awardTo) {
				let currentAmount = this.players[key].experience
					? parseInt(this.players[key].experience)
					: 0;
				let newAmount = currentAmount + amount;

				if (newAmount < 0) {
					newAmount = 0;
				}
				if (newAmount > 355000) {
					newAmount = 355000;
				}
				this.set_player_prop({
					uid: this.user.uid,
					id: key,
					property: "experience",
					value: newAmount,
				});
			}
			//In the finished encounter screen, set xp_awarded to true
			//And update the amount awarded if it was changed
			if (this.$route.name === "RunEncounter") {
				if (this.amount !== this.data.amount) {
					this.set_xp({
						campaignId: this.campaignId,
						encounterId: this.encounterId,
						type: "overwrite",
						value: this.amount,
					});
				}
				this.update_encounter_prop({
					campaignId: this.campaignId,
					encounterId: this.encounterId,
					property: "xp_awarded",
					value: true,
				});
			}
			this.setDrawer(false);
		},
	},
};
</script>

<style lang="scss">
.btn-group {
	width: 100%;

	label.btn {
		width: 50% !important;
	}
}
</style>
