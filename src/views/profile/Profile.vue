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
					<h2 class="text-center">Thanks for supporting us on Patreon, you really are a <b>{{ tier.name }}</b>!</h2>

					<p class="text-center"><i class="patreon-red fas fa-heart"></i></p>

					<div class="text-center">
						<h2 class="mb-1">Your tier: <span class="patreon-red">{{ tier.name }}</span></h2>
						<p v-if="tier.name == 'Deity'" class="gray-hover">You have unlimited power.</p>
						<ul class="benefits">
							<li v-for="(benefit, key) in tier.benefits" :key="key">
								<template v-if="key == 'ads'">Ads are removed</template>
								<template v-if="key == 'campaigns'">
									<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
									<span v-else class="green">{{ benefit }}</span> campaign slots
								</template>
								<template v-if="key == 'encounters'">
									<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
									<span v-else class="green">{{ benefit }}</span> encounter slots
								</template>
								<template v-if="key == 'players'">
									<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
									<span v-else class="green">{{ benefit }}</span> player slots
								</template>
								<template v-if="key == 'npcs'">
									<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
									<span v-else class="green">{{ benefit }}</span> NPC slots
								</template>
							</li>
						</ul>
					</div>
				</template>
				<template v-else>
					<h2>Support us on Patreon</h2>
					<Tiers />
					<!-- <a href="https://www.patreon.com/harmlesskey" target="_blank" class="btn btn-block bg-patreon-red"><i class="fab fa-patreon black"></i> Support us on Patreon</a> -->
				</template>
			</div>
		</div>

		<b-card header="Your Data" v-if="tier">
			<b-row>
				<b-col class="text-center">
					<i class="fas fa-dungeon gray-hover"></i>
					<h3 class="mb-0">
						<router-link to="/campaigns" class="gray-light">Campaigns</router-link>
					</h3>
						<span v-if="campaigns" :class="{ 'green': true, 'red': Object.keys(campaigns).length >= tier.benefits.campaigns }">{{ Object.keys(campaigns).length }}</span> 
						<span v-else class="green">0</span> / 
						<i v-if="tier.benefits.campaigns == 'infinite'" class="far fa-infinity"></i>
						<span v-else>{{ tier.benefits.campaigns }}</span>
				</b-col>
				<b-col class="text-center">
					<i class="fas fa-user gray-hover"></i>
					<h3 class="mb-0">
						<router-link to="/players" class="gray-light">Players</router-link>
					</h3>
					<span v-if="players" :class="{ 'green': true, 'red': Object.keys(players).length >= tier.benefits.players }">{{ Object.keys(players).length }}</span> 
					<span v-else class="green">0</span> / 
					<i v-if="tier.benefits.players == 'infinite'" class="far fa-infinity"></i>
					<span v-else>{{ tier.benefits.players }}</span>
				</b-col>
				<b-col class="text-center">
					<i class="fas fa-dragon gray-hover"></i>
					<h3 class="mb-0">
						<router-link to="/npcs" class="gray-light">NPC's</router-link>
					</h3>
					<span v-if="npcs" :class="{ 'green': true, 'red': Object.keys(npcs).length >= tier.benefits.npcs }">{{ Object.keys(npcs).length }}</span> 
					<span v-else class="green">0</span> / 
					<i v-if="tier.benefits.npcs == 'infinite'" class="far fa-infinity"></i>
					<span v-else>{{ tier.benefits.npcs }}</span>
				</b-col>
			</b-row>
			<router-link v-if="tier.name != 'Deity'" class="btn btn-block bg-patreon-red mt-3" to="/patreon">Need more?</router-link>
		</b-card>

		<b-card header="Actions">
			<p v-if="resetError" class="red text-center"><i class="fas fa-exclamation-triangle"></i> {{ resetError }}</p>
			<p v-if="resetSuccess" class="green text-center"><i class="fas fa-check"></i> {{ resetSuccess }}</p>
			<b-row class="text-center">
				<b-col>
					<a @click="resetPassword()" class="gray-hover"><i class="fas fa-redo-alt blue"></i><br/>Reset Password</a>
				</b-col>
				<b-col>
					<router-link to="/profile/delete-account" class="gray-hover"><i class="fas fa-trash-alt red"></i><br/>Delete account</router-link>
				</b-col>
			</b-row>
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
					vm.error = error.message;
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
	ul.benefits {
		padding: 0;
		list-style: none;
	}
</style>