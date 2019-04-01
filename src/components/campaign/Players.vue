<template>
	<div>
		<template v-if="players && campaign">
			<ul class="entities hasImg" v-if="campaign.players">
				<li v-for="(player, key) in campaign.players" :key="key" class="d-flex justify-content-between">
					<div class="d-flex justify-content-left">
						<span v-if="players[key].avatar" class="img" :style="{ backgroundImage: 'url(\''+ players[key].avatar + '\')' }"></span>
						<img v-else src="@/assets/_img/styles/player.png" class="img" />
						{{ players[key].character_name }}
					</div>
						{{ player.curHp }}/{{ players[key].maxHp }}
					
					<div class="actions bg-gray">
						<a class="gray-hover" v-b-tooltip.hover title="Edit player" @click="edit(key)">
							<i class="fas fa-pencil"></i>
						</a>
					</div>
					<i class="ml-3 far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
				</li>
			</ul>
		</template>
		<div v-else class="loader"><span>Loading Players...</span></div>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Players',
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
			}
		},
		computed: {
			...mapGetters([
				'campaign',
				'players',
				'playerInCampaign',
			]),
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
			edit(key) {
				this.setSlide({
					show: true,
					type: 'editPlayer',
					key: key,
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	
</style>