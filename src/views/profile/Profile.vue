<template>
	<div class="content" v-if="tier && userInfo">
		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-6">
				<hk-card header="Your Profile">
					<div class="card-body">
						<div>
							<h4>{{ userInfo.username }}</h4>
							<p class="info">
								<span class="neutral-3">Created:</span> {{ makeDate(user.metadata.creationTime, true) }}<br/>
								<span class="neutral-3">Last login:</span> {{ makeDate(user.metadata.lastSignInTime, true) }}
							</p>
						</div>
					</div>
				</hk-card>
			<!-- Content -->
				<hk-card header="Your content">
					<div class="card-body">
						<q-list>
							<!-- Campaigns -->
							<q-item v-for="{type, icon} in content_types" :to="`/content/${type}`" :key="type">
									<q-item-section avatar>
										<i class="fas" :class="icon"/>
									</q-item-section>
									<q-item-section>
										{{ type.capitalize() }}
									</q-item-section>
									<q-item-section side>
										<div>
											<span :class="{ 'green': true, 'red': content_count[type] >= tier.benefits[type] }"> 
												{{ content_count[type] }}
											</span> 
											<span class="neutral-2"> / </span>
											<i v-if="tier.benefits[type] == 'infinite'" class="far fa-infinity"></i>
											<span v-else>{{ tier.benefits[type] }}</span>
										</div>
									</q-item-section>
							</q-item>
						</q-list>
						<router-link v-if="tier.name != 'Deity'" class="btn btn-block bg-patreon-red mt-3" to="/patreon">Need more?</router-link>
					</div>
				</hk-card>

				<hk-card header="Your subscription">
					<!-- HAS A SUBSCRIPTION -->
					<div v-if="tier && tier.name != 'Free'" class="card-body">
						<!-- PATRON -->
						<div v-if="userInfo.patron">
							<h3><i class="fab fa-patreon patreon-red"></i> Patreon: <b>{{ userInfo.patron.tier }}</b></h3>
							<p>Thank you so much for your support. <i class="patreon-red fas fa-heart"></i></p>

							<div v-if="userInfo.patron.last_charge_status === 'Declined' && new Date(userInfo.patron.pledge_end) > new Date()" class="red">
								<h3>Payment Declined</h3>
								<p>
									Your last payment on Patreon was declined, your subscription will automatically be cancelled on <b>{{ makeDate(userInfo.patron.pledge_end) }}</b>.<br/>
									Go to <a href="https://www.patreon.com" target="_blank" rel="noopener">patreon.com</a> to check your payment details.
								</p>
							</div>
							<small><a href="https://www.patreon.com/join/harmlesskey/checkout?edit=1" target="_blank" rel="noopener">Cancel subscription</a></small>
							<hr>
						</div>

						<!-- VOUCHER -->
						<div v-if="voucher">
							<h3><i class="fas fa-ticket-alt"></i> Voucher subscription</h3>
							<p v-if="voucher.message" class="green">{{ voucher.message }}</p>
							<p >Your voucher ends on: 
								<span class="red" v-if="voucher.date">{{ makeDate(voucher.date, false) }}</span>
								<i v-else>never</i>.
							</p>
							<hr>
						</div>

						<!-- TIER -->
						<div>
							<h3 class="mb-1">Subscription tier: <span class="patreon-red">{{ tier.name }}</span></h3>
							<p v-if="tier.name == 'Deity'" class="neutral-2">You have unlimited power.</p>
							<ul class="benefits">
								<li v-for="(benefit, key) in tier.benefits" :key="key">
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
									<template v-if="key == 'reminders'">
										<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
										<span v-else class="green">{{ benefit }}</span> Reminder slots
									</template>
									<template v-if="key == 'items'">
										<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
										<span v-else class="green">{{ benefit }}</span> Item slots
									</template>
								</li>
							</ul>
						</div>
					</div>
			</hk-card>
					
				<!-- ACTIONS -->
				<hk-card>
					<div class="card-body actions">
						<p v-if="resetError" class="red text-center"><i class="fas fa-exclamation-triangle"></i> {{ resetError }}</p>
						<p v-if="resetSuccess" class="green text-center"><i class="fas fa-check"></i> {{ resetSuccess }}</p>

						<div class="d-flex justify-content-between">
							<a @click="resetPassword()" class="btn btn-sm btn-clear">
								<i class="fas fa-redo-alt blue mr-1"></i> Reset Password
							</a>
							<router-link to="/profile/delete-account" class="btn btn-sm btn-clear">
								<i class="fas fa-trash-alt red mr-1"></i> Delete account
							</router-link>
						</div>
					</div>
				</hk-card>
			</div>

			<!-- PUBLIC INITIATIE LINK -->
			<div class="col">
				<hk-card>
					<div class="card-header" slot="header">
						<span><i class="fas fa-link"></i> Public initiative Link</span>
					</div>
					<div class="card-body">
						<PlayerLink />
					</div>
				</hk-card>
			</div>
		</div>
		
		<hk-card v-if="!tier || tier.name === 'Free'">
			<div class="card-header" slot="header">
				Support us on Patreon
			</div>
			<div class="card-body">
				<p>Get instant access to more storage.</p>
				<Tiers />
			</div>
		</hk-card>
	</div>
</template>

<script>
	import Tiers from "@/components/Tiers.vue";
	import PlayerLink from "@/components/PlayerLink.vue";
	import { auth } from "@/firebase";
	import { general } from "@/mixins/general.js";
	import { mapGetters } from "vuex";

export default {
		name: "Profile",
		components: {
			Tiers,
			PlayerLink,
		},
		mixins: [general],
		metaInfo: {
			title: "Profile"
		},
		data() {
			return {
				error: "",
				resetError: undefined,
				resetSuccess: undefined,
				content_types: [
					{
						type: "campaigns",
						icon: "fa-dungeon",
					},
					{
						type: "players",
						icon: "fa-user"
					},
					{
						type: "npcs",
						icon: "fa-dragon"
					},
					{
						type: "reminders",
						icon: "fa-stopwatch"
					},
					{
						type: "items",
						icon: "fa-staff"
					}
				]
			}
		},
		computed: {
			...mapGetters([
				"user",
				"userInfo",
				"tier",
				"voucher",
				"content_count"
			])
		},
		methods: {
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		.user {
			display: grid;
			grid-template-columns: 120px 1fr;
			
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
		}

		ul.benefits {
			padding: 0;
			list-style: none;
		}

		.q-item {
			background-color: $neutral-8;
			margin-bottom: 1px;
		}
	}
</style>