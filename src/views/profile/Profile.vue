<template>
	<q-no-ssr class="content" v-if="tier && userInfo">
		<user-banner />
		<Tutorial v-if="show_tutorial" />
		<div class="row q-col-gutter-md">
			<div class="col-12">
				<hk-card header="Your subscription">
					<div class="card-body">
						<!-- HAS A SUBSCRIPTION -->
						<template v-if="tier && tier.name !== 'Free'">
							<!-- PATRON -->
							<div v-if="userInfo.patron">
								<h3>
									<i aria-hidden="true" class="fab fa-patreon patreon-red"></i> Patreon:
									<b>{{ userInfo.patron.tier }}</b>
								</h3>
								<p>
									Thank you so much for your support.
									<i aria-hidden="true" class="patreon-red fas fa-heart"></i>
								</p>

								<div
									v-if="
										userInfo.patron.last_charge_status === 'Declined' &&
										valid(userInfo.patron.pledge_end)
									"
								>
									<h3 class="red">Payment Declined</h3>
									<p>
										Your last payment on Patreon was declined, your subscription will automatically
										be cancelled on <b>{{ makeDate(userInfo.patron.pledge_end) }}</b
										>.<br />
										Go to
										<a href="https://www.patreon.com" target="_blank" rel="noopener">patreon.com</a>
										to check your payment details.
									</p>
								</div>
								<div v-if="!valid(userInfo.patron.pledge_end)">
									<p>Your subscription <strong class="red">expired</strong></p>
									<a
										href="https://www.patreon.com/join/harmlesskey"
										target="_blank"
										class="btn bg-neutral-5"
										rel="noopener"
									>
										<i aria-hidden="true" class="fas fa-redo-alt blue mr-1" /> Renew
									</a>
								</div>
								<small v-else
									><a
										href="https://www.patreon.com/join/harmlesskey/checkout?edit=1"
										target="_blank"
										rel="noopener"
										>Cancel subscription</a
									></small
								>
								<hr />
							</div>
						</template>
						<!-- TIER -->
						<h3 class="mb-1">
							Subscription tier: <span class="patreon-red">{{ tier.name }}</span>
						</h3>
						<p v-if="tier.name == 'Deity'" class="neutral-2">You have unlimited power.</p>

						<Tier />
						<router-link
							v-if="tier.name === 'Free'"
							class="btn btn-block bg-patreon-red mt-4"
							to="/patreon"
						>
							Support us for more slots
						</router-link>
						<div class="mt-3">
							<h3><i aria-hidden="true" class="fas fa-ticket-alt"></i> Voucher subscription</h3>
							<template v-if="voucher">
								<p v-if="voucher.message" class="green">{{ voucher.message }}</p>
								<p>
									Your voucher ends on:
									<span class="red" v-if="voucher.date">{{ makeDate(voucher.date, false) }}</span>
									<i aria-hidden="true" v-else>never</i>.
								</p>
							</template>
							<template>
								<div class="d-flex justify-between">
									<q-input
										class="text-uppercase"
										:dark="$store.getters.theme === 'dark'"
										filled
										square
										v-model="voucher_input_text"
										label="Voucher code"
										v-on:keyup.enter="addVoucher"
									>
										<template v-slot:after>
											<button class="btn" @click="addVoucher">
												<i aria-hidden="true" class="fas fa-plus" />
											</button>
										</template>
									</q-input>
								</div>
							</template>
							<hr />
						</div>
					</div>
					<!-- VOUCHER -->
				</hk-card>
				<!-- Content -->
				<hk-card header="Your content">
					<div class="card-body">
						<Content />
						<router-link
							v-if="tier.name != 'Deity'"
							class="btn btn-block bg-neutral-5 mt-3"
							to="/patreon"
						>
							Need more slots?
						</router-link>
					</div>
				</hk-card>
			</div>
		</div>

		<!-- ACTIONS -->
		<hk-card class="mb-0">
			<div class="card-body actions">
				<p v-if="resetError" class="red text-center">
					<i aria-hidden="true" class="fas fa-exclamation-triangle" /> {{ resetError }}
				</p>
				<p v-if="resetSuccess" class="green text-center">
					<i aria-hidden="true" class="fas fa-check" /> {{ resetSuccess }}
				</p>

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
	</q-no-ssr>
</template>

<script>
import { auth } from "src/firebase";
import { general } from "src/mixins/general.js";
import { mapActions, mapGetters } from "vuex";
import Content from "src/components/userContent/Content";
import Tier from "src/components/userContent/Tier";
import UserBanner from "src/components/userContent/UserBanner";
import Tutorial from "src/components/userContent/Tutorial";

export default {
	name: "Profile",
	components: {
		UserBanner,
		Content,
		Tier,
		Tutorial,
	},
	preFetch({ store, redirect }) {
		if (!store.getters.user) {
			redirect("/sign-in");
		} else if (!store.getters.userInfo) {
			redirect("/set-username");
		}
	},
	mixins: [general],
	data() {
		return {
			error: "",
			resetError: undefined,
			resetSuccess: undefined,
			voucher_input_text: undefined,
			content_types: [
				{
					type: "campaigns",
					icon: "fa-dungeon",
				},
				{
					type: "players",
					icon: "fa-user",
				},
				{
					type: "npcs",
					icon: "fa-dragon",
				},
				{
					type: "spells",
					icon: "fa-wand-magic",
				},
				{
					type: "reminders",
					icon: "fa-stopwatch",
				},
				{
					type: "items",
					icon: "fa-staff",
				},
			],
		};
	},
	computed: {
		...mapGetters(["user", "userInfo", "tier", "voucher", "content_count"]),
		show_tutorial() {
			return (
				!this.content_count.campaigns ||
				!this.content_count.players ||
				!this.content_count.encounters
			);
		},
	},
	methods: {
		...mapActions(["set_active_voucher"]),
		resetPassword() {
			var vm = this;
			var emailAddress = this.user.email;

			auth
				.sendPasswordResetEmail(emailAddress)
				.then(function () {
					// Email sent.
					vm.resetSuccess =
						"An email was sent to " + emailAddress + " with a link to reset your password.";
					vm.resetError = undefined;
				})
				.catch(function (error) {
					// An error happened.
					vm.error = error.message;
				});
		},
		valid(end) {
			return new Date(end).toISOString() > new Date().toISOString();
		},
		async addVoucher() {
			this.set_active_voucher(this.voucher_input_text)
				.then(() => {
					this.$snotify.success(
						`Successfully added ${this.voucher_input_text.toUpperCase()} voucher.`
					);
					this.voucher_input_text = null;
				})
				.catch((error) => {
					this.$snotify.error(error);
				});
		},
	},
};
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
