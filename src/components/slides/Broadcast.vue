<template>
	<div>
		<hk-tip value="broadcast" title="Broadcast" content="Only when you're live, your players can see the initiative list of your active encounter." />
		<span 
			class="live mb-3" 
			:class="{'active': broadcast.live === campaign_id }">
			{{ broadcast.live === campaign_id ? "You're live" : "You're not live" }}
		</span>

		<p>
			When you're live, your players can see the initiative list 
			of your active encounter and you can choose to show them your rolls there as well.
			Your encounters can be followed with the <a @click="setSlide({show: true, type: 'PlayerLink'})">player link.</a>
		</p>

		<q-checkbox dark v-model="shares" val="rolls" label="Share rolls" />

		<a class="btn btn-block mt-4" @click="live()" >
			{{ broadcast.live === campaign_id ? "Stop broadcast" : "Go live" }}
		</a>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";

	export default {
		name: 'Broadcast',
		props: ["data"],
		data() {
			return {
				campaign_id: this.data.campaign_id,
				encounter_id: this.data.encounter_id,
				shares: [],
				rolls: [
					{
						label: "Action rolls",
						value: "action_rolls"
					},
					{
						label: "Initiative rolls",
						value: "initiative_rolls"
					},
					{
						label: "Ability checks",
						value: "ability_rolls"
					},
					{
						label: "Saving throws",
						value: "save_rolls"
					},
					{
						label: "Skill checks",
						value: "skill_rolls"
					},
					{
						label: "Skill checks",
						value: "skill_rolls"
					},
				]
			}
		},
		computed: {
			...mapGetters([
				"broadcast"
			])
		},
		methods: {
			...mapActions([
				"setLive",
				"setSlide"
			]),
			live() {
				this.setLive({
					campaign_id: this.campaign_id, 
					encounter_id: this.encounter_id,
					shares: this.shares
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.live {
		width: 100%;
	}
</style>