<template>
	<div class="signed">
		<div class="container">
			<router-link to="/home">
				<img class="logo" src="@/assets/_img/logo/logo-main-icon-left.svg" alt="Harmless Key logo" />
			</router-link>

			<div class="row q-col-gutter-lg">
				<div class="col-12 col-md-6">
					<h2>Dungeon Master</h2>					
					<q-list dark class="mb-4">
						<q-item 
							v-for="({name, icon, label}, index) in dm_tabs" 
							clickable v-ripple 
							:to="`/${name}`"
							:key="`dm-${index}`"
						>
							<q-item-section avatar>
								<q-icon :name="icon" />
							</q-item-section>
							<q-item-section>{{ label }}</q-item-section>
						</q-item>
					</q-list>
				</div>
				
				<div class="col-12 col-md-6">
					<h2>Player</h2>					
					<q-list dark>
						<q-item 
							v-for="({name, icon, label}, index) in player_tabs" 
							clickable v-ripple 
							:to="`/${name}`"
							:key="`player-${index}`"
						>
							<q-item-section avatar>
								<q-icon :name="icon" />
							</q-item-section>
							<q-item-section>{{ label }}</q-item-section>
						</q-item>
					</q-list>
				</div>
			</div>

			<!-- PATREON -->
			<div>
				<h4 
					v-if="tier && userInfo && userInfo.patron"
					class="text-center patreon-red"
				>
					<i class="patreon-red fas fa-heart"/> Thanks for your '{{ userInfo.patron.tier}}' support.
				</h4>
				<a v-else href="https://www.patreon.com/join/harmlesskey" target="_blank" rel="noopener" class="patreon-red"><i class="fab fa-patreon"></i> Support us on Patreon</a>
			</div>

			<div class="share bg-gray-dark">
				<a class="btn btn-lg btn-block bg-blue" @click="setSlide({ show: true, type: 'PlayerLink'})">
					<i class="fas fa-share-alt"></i> Share your encounters
				</a>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';

	export default {
		name: 'SignedIn',
		data() {
			return {
				play_animation: true,
				muted: true,
				video_hover: false,
				dm_tabs: [
					{
						name: "campaigns",
						label: "Campaigns",
						icon: "fas fa-dungeon"
					},
					{
						name: "players",
						label: "Players",
						icon: "fas fa-users"
					},
					{
						name: "npcs",
						label: "NPC's",
						icon: "fas fa-dragon"
					},
					{
						name: "reminders",
						label: "Reminders",
						icon: "fas fa-stopwatch"
					},
					{
						name: "items",
						label: "Items",
						icon: "fas fa-staff"
					}
				],
				player_tabs: [
					{
						name: "characters",
						label: "Characters",
						icon: "fas fa-helmet-battle"
					},
					{
						name: "followed",
						label: "Following",
						icon: "fas fa-users"
					}
				]
			}
		},
		computed: {
			...mapGetters([
				'user',
				'tier',
				'voucher',
				'userInfo',
			]),
			copy() {
				return (this.$store.getters.user) ? window.origin + '/user/' + this.$store.getters.user.uid : undefined;
			}
		},
		methods: {
			...mapActions([
				"setSlide"
			])
		}
	}
</script>

<style lang="scss" scoped>
	.signed {
		background-image: url('../../assets/_img/styles/paper-bg.png');
		color: #fff;
		background-position: top center;
		background-color: #000;
		overflow: hidden;
		height: calc(100vh - 50px);
		padding-bottom: 78px;

		.container {
			padding-top: 30px;

			.q-item {
				background-color: #232323;
				margin-bottom: 1px;

				&:hover {
					background-color: #000;
				}
			}

			.logo {
				width: 100%;
				max-width: 300px;
				margin-bottom: 20px;
			}

			h2 {
				font-family: 'Fredericka the Great', cursive;
				margin-bottom: 10px;
			}
			h4 {
				font-size: 18px;
			}

			.share {
				position: fixed;
				bottom: 0;
				left: 0;
				width: 100%;
				padding: 20px 20px 20px 20px;
			}
		}
	}
</style>