<template>
	<div>
		<HKtable
			class="mb-4"
			:items="campaignPlayers"
			:columns="columns"
		>	
			<template slot="image" slot-scope="data">
				<div class="image" v-if="players[data.row.key].avatar" :style="{ backgroundImage: 'url(\'' + players[data.row.key].avatar + '\')' }"></div>
				<img v-else class="image" src="@/assets/_img/styles/player.svg" />
			</template>

			<template slot="maxHp" slot-scope="data">
				<span class="current" :class="{ 
					'red': percentage(data.row.curHp, maxHp(data.item, data.row.maxHpMod)) <= 33, 
					'orange': percentage(data.row.curHp, maxHp(data.item, data.row.maxHpMod)) > 33 && percentage(data.row.curHp, players[data.row.key].maxHp) <= 76, 
					'green': true
				}">
					{{ data.row.curHp }}
				</span>
				<span class="gray-hover">/</span>
				<span :class="{ 
						'green': data.row.maxHpMod > 0, 
						'red': data.row.maxHpMod < 0 
					}" 
					v-b-tooltip.hover :title="'Max HP + ' + data.row.maxHpMod" v-if="data.row.maxHpMod">
					{{ maxHp(players[data.row.key].maxHp, data.row.maxHpMod) }}
				</span>
				<span v-else>{{ players[data.row.key].maxHp }}</span>
				<span v-if="data.row.tempHp" class="gray-hover">+{{ data.row.tempHp }}</span>
			</template>

			<div slot="actions" slot-scope="data" class="actions">
				<a class="gray-hover" v-b-tooltip.hover title="Edit player" 
					@click="setSlide({
						show: true,
						type: 'slides/EditPlayer',
						data: { key: data.item.key, location: 'overview'}
					})">
					<i class="fas fa-pencil"></i>
				</a>
			</div>
		</HKtable>

		<button class="btn btn-block" @click="reset()"><i class="fas fa-undo-alt"></i> Reset Player Health</button>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { db } from '@/firebase';
	import HKtable from '@/components/hk-components/hk-table.vue';

	export default {
		name: 'Players',
		components: {
			HKtable
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
			}
		},
		firebase() {
			return {
				settings: {
					source: db.ref(`settings/${this.user.uid}/general`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'campaign',
				'players',
				'playerInCampaign',
			]),
			campaignPlayers() {
				let players = [];

				for(let key in this.campaign.players) {
					let player = this.campaign.players[key];
					player.key = key;
					player.name = this.players[key].character_name;
					player.ac = this.players[key].ac;
					player.maxHp = this.players[key].maxHp;
					player.passive_perception = this.players[key].passive_perception;
					player.passive_investigation = this.players[key].passive_investigation;
					player.passive_insight = this.players[key].passive_insight;
					player.spell_save_dc = this.players[key].spell_save_dc;
					
					
					players.push(player)
				}

				return players;
			},
			columns() {
				let columns = {
					image: {
                        width: 46,
                        noPadding: true
					},
					ac: {
						label: '<i class="fas fa-shield"></i>',
						center: true,
						maxContent: true
					},
					name: {
						truncate: true
                    },
				}

				if(this.settings.passive_perception === undefined) {
					columns.passive_perception = {
						label: '<i class="fas fa-eye"></i>',
						maxContent: true
					}
				}
				if(this.settings.passive_investigation === undefined) {
					columns.passive_investigation = {
						label: '<i class="fas fa-search"></i>',
						maxContent: true
					}
				}
				if(this.settings.passive_insight === undefined) {
					columns.passive_insight = {
						label: '<i class="fas fa-lightbulb-on"></i>',
						maxContent: true
					}
				}
				if(this.settings.save_dc === undefined) {
					columns.spell_save_dc = {
						label: '<i class="fas fa-hand-holding-magic"></i>',
						maxContent: true
					}
				}

				columns.maxHp = {
					label: '<i class="fas fa-heart"></i>',
					maxContent: true
				}
				columns.actions = {
					label: '<i class="far fa-ellipsis-h"></i>',
					noPadding: true,
					right: true,
					maxContent: true
                };

				return columns;
			}
		},
		mounted() {
			this.fetchCampaign({
				cid: this.campaignId, 
			})
		},
		methods: {
			...mapActions([
				'fetchCampaign',
				'setSlide',
			]),
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			maxHp(maxHp, maxHpMod) {
				return maxHp + maxHpMod;
			},
			reset() {
				for(var key in this.campaign.players) {
					db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players/${key}`).update({
						curHp: this.players[key].maxHp,
						tempHp: 0,
						maxHpMod: 0
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>