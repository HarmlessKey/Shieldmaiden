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
		
		<q-select
			dark filled square
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
						<q-checkbox dark v-model="all" @input="checkAll"/>
					</q-item-section>
				</q-item>
			</template>
			<template v-slot:option="scope">
				<q-item
					v-bind="scope.itemProps"
					v-on="scope.itemEvents"      
				>
					<q-item-section>
						<q-item-label v-html="scope.opt.label"/>
					</q-item-section>
					<q-item-section side>
						<q-checkbox dark v-model="shares" @input="sharesSelected" :val="scope.opt.value"/>
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
				campaign_id: this.data.campaign_id,
				encounter_id: this.data.encounter_id,
				sharesSetter: undefined,
				all: false
			}
		},
		computed: {
			...mapGetters([
				"broadcast",
				"campaign"
			]),
			options() {
				let options =[
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
				];
				if(this.campaign.advancement === "experience") {
					options.push({
						label: "Experience awards",
						value: "xp"
					});
				}
				return options;
			},
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
		methods: {
			...mapActions([
				"setLive",
				"setLiveShares",
				"setSlide"
			]),
			live() {
				this.setLive({
					campaign_id: this.campaign_id, 
					encounter_id: this.encounter_id,
					shares: this.shares
				});
			},
			checkAll (v) {
				if (v) {
					this.shares = this.options.map(v => v.value);
					this.sharesSelected();
					return
				}
				this.sharesCleared();
			},
			sharesSelected () {
				if (this.shares.length === this.options.length) {
					this.all = true
				} else {
					this.all = false
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