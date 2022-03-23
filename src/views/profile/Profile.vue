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
						<Content />
						<router-link v-if="tier.name != 'Deity'" class="btn btn-block bg-neutral-5 mt-3" to="/patreon">
							Need more slots?
						</router-link>
					</div>
				</hk-card>

				<hk-card header="Your subscription">
					<div class="card-body">
					<!-- HAS A SUBSCRIPTION -->
					<template v-if="tier && tier.name !== 'Free'">
						<!-- PATRON -->
						<div v-if="userInfo.patron">
							<h3><i aria-hidden="true" class="fab fa-patreon patreon-red"></i> Patreon: <b>{{ userInfo.patron.tier }}</b></h3>
							<p>Thank you so much for your support. <i aria-hidden="true" class="patreon-red fas fa-heart"></i></p>

							<div v-if="userInfo.patron.last_charge_status === 'Declined' && valid(userInfo.patron.pledge_end)">
								<h3 class="red">Payment Declined</h3>
								<p>
									Your last payment on Patreon was declined, your subscription will automatically be cancelled on <b>{{ makeDate(userInfo.patron.pledge_end) }}</b>.<br/>
									Go to <a href="https://www.patreon.com" target="_blank" rel="noopener">patreon.com</a> to check your payment details.
								</p>
							</div>
							<div v-if="!valid(userInfo.patron.pledge_end)"> 
								<p>Your subscription <strong class="red">expired</strong></p>
								<a href="https://www.patreon.com/join/harmlesskey" target="_blank" class="btn bg-neutral-5" rel="noopener">
									<i aria-hidden="true" class="fas fa-redo-alt blue mr-1" /> Renew
								</a>
							</div>
							<small v-else><a href="https://www.patreon.com/join/harmlesskey/checkout?edit=1" target="_blank" rel="noopener">Cancel subscription</a></small>
							<hr>
						</div>

						<!-- VOUCHER -->
						<div v-if="voucher">
							<h3><i aria-hidden="true" class="fas fa-ticket-alt"></i> Voucher subscription</h3>
							<p v-if="voucher.message" class="green">{{ voucher.message }}</p>
							<p >Your voucher ends on: 
								<span class="red" v-if="voucher.date">{{ makeDate(voucher.date, false) }}</span>
								<i aria-hidden="true" v-else>never</i>.
							</p>
							<hr>
						</div>
					</template>
					<!-- TIER -->
					<h3 class="mb-1">Subscription tier: <span class="patreon-red">{{ tier.name }}</span></h3>
					<p v-if="tier.name == 'Deity'" class="neutral-2">You have unlimited power.</p>					

					<Tier />
					<router-link v-if="tier.name === 'Free'" class="btn btn-block bg-patreon-red mt-4" to="/patreon">
						Support us for more slots
					</router-link>
				</div>
			</hk-card>
					
				<!-- ACTIONS -->
				<hk-card>
					<div class="card-body actions">
						<p v-if="resetError" class="red text-center"><i aria-hidden="true" class="fas fa-exclamation-triangle" /> {{ resetError }}</p>
						<p v-if="resetSuccess" class="green text-center"><i aria-hidden="true" class="fas fa-check" /> {{ resetSuccess }}</p>

						<div class="d-flex justify-content-between">
							<a @click="resetPassword()" class="btn btn-sm btn-clear">
								<i aria-hidden="true" class="fas fa-redo-alt blue mr-1" /> Reset Password
							</a>
							<router-link to="/profile/delete-account" class="btn btn-sm btn-clear">
								<i aria-hidden="true" class="fas fa-trash-alt red mr-1" /> Delete account
							</router-link>
						</div>
					</div>
				</hk-card>
			</div>

			<!-- PUBLIC INITIATIE LINK -->
			<div class="col">
				<hk-card>
					<div class="card-header" slot="header">
						<span><i aria-hidden="true" class="fas fa-link"></i> Public initiative link</span>
					</div>
					<div class="card-body">
						<PlayerLink />
					</div>
				</hk-card>
			</div>
		</div>
	</div>
</template>

<script>
	import Tiers from "@/components/Tiers.vue";
	import PlayerLink from "@/components/PlayerLink.vue";
	import { auth } from "@/firebase";
	import { general } from "@/mixins/general.js";
	import { mapGetters } from "vuex";
	import Content from "@/components/userContent/Content";
	import Tier from "@/components/userContent/Tier";


export default {
		name: "Profile",
		components: {
			Tiers,
			PlayerLink,
			Content,
			Tier
		},
		mixins: [general],
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
			},
			valid(end) {
				return new Date(end).toISOString() > new Date().toISOString();
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
	}
</style>