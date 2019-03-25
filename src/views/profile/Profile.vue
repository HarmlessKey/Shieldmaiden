<template>
	<div class="container">
		<b-card header="Your Profile">
			<b-row>
				<b-col md="2" v-if="user.photoURL">
					<div class="img" :style="{'background-image': 'url(' + user.photoURL + ')'}"></div>
				</b-col>
				<b-col>
					<h2 v-if="userInfo">{{ userInfo.username }}</h2>
					<p class="info">
						<span class="gray-hover">Created:</span> {{ makeDate(user.metadata.creationTime) }}<br/>
						<span class="gray-hover">Last login:</span> {{ makeDate(user.metadata.lastSignInTime) }}
					</p>
				</b-col>
			</b-row>
		</b-card>

		<div class="card">
			<div class="card-header"><i class="fab fa-patreon patreon-red"></i> Patreon</div>
			<div class="card-body">
				<template v-if="tier && tier.name != 'Free'">
					<h2>Tier: {{ tier.name }}</h2>
					<p>Thanks for supporting us on Patreon, you really are a <b>{{ tier.name }}</b>!</p>

					<h3>Your benefits:</h3>
					<ul>
						<li v-for="(benefit, key) in tier.benefits" :key="key">
							<template v-if="key == 'ads'">Ads are removed</template>
							<template v-if="key == 'campaigns'"><span class="green">{{ benefit }}</span> campaign slots</template>
							<template v-if="key == 'encounters'"><span class="green">{{ benefit }}</span> encounter slots</template>
							<template v-if="key == 'players'"><span class="green">{{ benefit }}</span> player slots</template>
							<template v-if="key == 'npcs'"><span class="green">{{ benefit }}</span> NPC slots</template>
						</li>
					</ul>
				</template>
				<template v-else>
					<h2>Support us on Patreon</h2>
					<Tiers />
					<!-- <a href="https://www.patreon.com/harmlesskey" target="_blank" class="btn btn-block bg-patreon-red"><i class="fab fa-patreon black"></i> Support us on Patreon</a> -->
				</template>
			</div>
		</div>

		<b-card header="Data" v-if="tier">
			<b-row>
				<b-col class="text-center">
					<h2 class="mb-0">
						<div v-if="campaigns">
						<span :class="{ 'green': true, 'red': Object.keys(campaigns).length >= tier.benefits.campaigns }">{{ Object.keys(campaigns).length }}</span>
						 / {{ tier.benefits.campaigns }}
						</div>
						<div v-else><span class="green">0</span> / {{ tier.benefits.campaigns }}</div>
						<router-link to="/campaigns" class="gray-hover">Campaigns</router-link>
					</h2>
				</b-col>
				<b-col class="text-center">
					<h2 class="mb-0">
						<div v-if="players">
							<span :class="{ 'green': true, 'red': Object.keys(players).length >= tier.benefits.players }">{{ Object.keys(players).length }}</span> 
							/ {{ tier.benefits.players }}
						</div>
						<div v-else><span class="green">0</span> / {{ tier.benefits.players }}</div>
						<router-link to="/players" class="gray-hover">Players</router-link>
					</h2>
				</b-col>
				<b-col class="text-center">
					<h2 class="mb-0">
						<div v-if="npcs">
							<span :class="{ 'green': true, 'red': Object.keys(npcs).length >= tier.benefits.npcs }">{{ Object.keys(npcs).length }}</span> 
								/ {{ tier.benefits.npcs }}
						</div>
						<div v-else><span class="green">0</span> / {{ tier.benefits.npcs }}</div>
						<router-link to="/npcs" class="gray-hover">NPC's</router-link>
					</h2>
				</b-col>
			</b-row>
		</b-card>

		<b-card header="Actions">
			<p v-if="resetError" class="red"><i class="fas fa-exclamation-triangle"></i> {{ resetError }}</p>
			<p v-if="resetSuccess" class="green"><i class="fas fa-check"></i> {{ resetSuccess }}</p>
			<p><a @click="resetPassword()" class="gray-hover"><i class="fas fa-redo-alt blue"></i> Reset Password</a></p>
			<p><router-link to="/profile/delete-account" class="gray-hover"><i class="fas fa-trash-alt red"></i> Delete account</router-link></p>
		</b-card>
	</div>
</template>

<script>
	import Tiers from '@/components/Tiers.vue'
	import { db, auth } from '@/firebase'	
	import { mapGetters } from 'vuex'

export default {
		name: 'Profile',
		components: {
			Tiers,
		},
		metaInfo: {
			title: 'Profile'
		},
		data() {
			return {
				error: '',
				resetError: undefined,
				resetSuccess: undefined,
			}
		},
		firebase() {
			return {
				tiers: db.ref('tiers').orderByChild('order'),
			}
		},
		computed: {
			...mapGetters([
				'campaigns',
				'players',
				'npcs',
				'userInfo',
				'tier',
			]),
			...mapGetters({
				user: 'getUser'
			})
		},
		methods: {
			makeDate(input) {
				let monthNames = [
					"January", "February", "March",
					"April", "May", "June", "July",
					"August", "September", "October",
					"November", "December"
				];

				let d = new Date(input)
				let hours = (d.getHours() < 10) ? '0'+d.getHours() : d.getHours();
				let minutes = (d.getMinutes() < 10) ? '0'+d.getMinutes() : d.getMinutes();
				let seconds = (d.getSeconds() < 10) ? '0'+d.getSeconds() : d.getSeconds();

				let time = hours + ":" + minutes + ":" + seconds;
				let date = d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
				return date + " - " + time;
			},
			resetPassword() {
				var vm = this;
				var emailAddress = this.user.email;

				auth.sendPasswordResetEmail(emailAddress).then(function() {
					// Email sent.
					vm.resetSuccess = 'An email was sent to ' + emailAddress + ' with a link to reset your password.';
					vm.resetError = undefined;
				}).catch(function(error) {
					// An error happened.
					vm.error = err.message;
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.img {
		width: 100px;
		height: 100px;
		margin-bottom: 20px;
		border-radius: 50%;
		display: block;
		background-size: cover;
		background-position: center top;
	}
	.info {
		span {
			width: 80px;
			display: inline-block;
		}
	}
</style>