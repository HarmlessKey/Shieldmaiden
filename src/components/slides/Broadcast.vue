<template>
	<div>
		<hk-tip 
			value="broadcast" 
			title="Broadcast" 
			content="Only when you're live, your players can see the initiative list of your active encounter." 
		/>
		<span 
			class="live mb-3" 
			:class="{'active': broadcast.live === campaign_id }">
			{{ broadcast.live === campaign_id ? "You're live" : "You're not live" }}
		</span>

		<p>
			When you're live, your players can see the initiative list 
			of your active encounter and you can choose to show them your rolls there as well.
			Your encounters can be followed with your <a @click="setSlide({show: true, type: 'PlayerLink'})">public initiative link.</a>
		</p>
		
		<q-select
			:dark="$store.getters.theme === 'dark'" filled square
			v-model="shares"
			:options="options"
			label="Share"
			options-dense
			multiple
			emit-value
			map-options
			@input="sharesSelected"
		>
			<template #before-options>
				<q-item>
					<q-item-section>
						<q-item-label>Select All</q-item-label>
					</q-item-section>
					<q-item-section side>
						<q-checkbox 
							:dark="$store.getters.theme === 'dark'" 
							v-model="all" 
							@input="checkAll"
							:indeterminate-value="false"
							:false-value="null"
						/>
					</q-item-section>
				</q-item>
			</template>
			<template v-slot:option="scope">
				<q-item
					v-bind="scope.itemProps"
					v-on="scope.itemEvents"      
				>
					<q-item-section>
						<q-item-label v-text="scope.opt.label"/>
					</q-item-section>
					<q-item-section side>
						<q-checkbox :dark="$store.getters.theme === 'dark'" v-model="shares" @input="sharesSelected" :val="scope.opt.value"/>
					</q-item-section>
				</q-item>
			</template>
			<template v-slot:append>
				<q-icon v-if="shares.length > 0 && !broadcast.live" name="close" @click.stop="sharesCleared" class="cursor-pointer" />
			</template>
		</q-select>

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
				user: this.$store.getters.user,
				campaign_id: this.data.campaign_id,
				encounter_id: this.data.encounter_id,
				campaign: {},
				sharesSetter: undefined,
				all: null,
				options: [
					{
						label: "Action rolls",
						value: "action_rolls"
					},
					{
						label: "General rolls",
						value: "general_rolls"
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
					}
				]
			}
		},
		computed: {
			...mapGetters([
				"broadcast",
			]),
			shares: {
				get() {
					const shares = (this.broadcast.shares) ? this.broadcast.shares : [];
					return (this.sharesSetter) ? this.sharesSetter : shares;
				},
				set(newVal) {
					this.sharesSetter = newVal;
				}
			}
		},
		async mounted() {
			this.campaign = await this.get_campaign({
				uid: this.user.uid,
				id: this.campaign_id
			});
			if(this.campaign.advancement === "experience") {
				this.options.push({
					label: "Experience awards",
					value: "xp"
				});
			}
		},
		methods: {
			...mapActions([
				"setLive",
				"setLiveShares",
				"setSlide"
			]),
			...mapActions("campaigns", ["get_campaign"]),
			live() {
				this.setLive({
					campaign_id: this.campaign_id, 
					encounter_id: this.encounter_id,
					shares: this.shares
				});
			},
			checkAll (v) {
				if (v) {
					this.shares = this.options.map(item => item.value);
					this.sharesSelected();
					return
				}
				this.sharesCleared();
			},
			sharesSelected () {
				if (this.shares.length === this.options.length) {
					this.all = true
				} else if (this.shares.length) {
					this.all = false
				} else {
					this.all = null
				}
				if(this.broadcast.live) this.setLiveShares(this.shares);
			},
			sharesCleared () {
				this.all = false;
				this.shares = [];
				this.sharesSelected();
				if(this.broadcast.live) this.setLiveShares(this.shares);
			},
		}
	}
</script>

<style lang="scss" scoped>
	.live {
		width: 100%;
	}
</style>