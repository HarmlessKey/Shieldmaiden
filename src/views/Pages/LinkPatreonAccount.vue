<template>
	<div class="p-4">
		<hk-loader v-if="loading" no-background />
		<div v-else class="d-flex flex-col items-center">
			<hk-card v-if="!patreon_auth" class="patron-card">
				<div v-if="$route.query?.code" class="card-body">
					Something went wrong while fetching your Patreon account, please try again.
				</div>
				<div slot="footer" class="card-footer">
					<PatreonLinkButton class="btn-block" />
				</div>
			</hk-card>
			<template v-else-if="patreon_user">
				<hk-card class="patron-card">
					<template v-if="!userInfo.patreon_id">
						<hk-loader v-if="linking" />
						<template v-else>
							<div class="card-body">
								<img :src="patreon_user.attributes?.thumb_url" />
								<div v-if="id_taken" class="red mb-2">
									This profile is already linked to different Shieldmaiden account
								</div>
								<div class="name">{{ patreon_user.attributes?.full_name }}</div>
								<div class="email">{{ patreon_user.attributes?.email }}</div>
								<a
									:href="patreon_user.attributes?.url"
									target="_blank"
									rel="noopener"
									class="btn btn-sm bg-neutral-5 mt-3"
									>View profile</a
								>
							</div>
							<div slot="footer" class="card-footer">
								<router-link
									class="btn bg-neutral-5 mr-2"
									:class="{ 'full-width': id_taken }"
									to="/profile"
								>
									{{ id_taken ? "Back to profile" : "Cancel" }}
								</router-link>
								<button v-if="!success && !id_taken" class="btn" @click="link">
									<hk-icon icon="fas fa-link" class="mr-2" /> Link account
								</button>
							</div>
						</template>
					</template>
					<template v-else>
						<hk-loader v-if="linking" />
						<template v-else>
							<div class="card-body">
								<strong v-if="success" class="green mb-2">Account successfully linked</strong>
								<p v-else>Your account is already linked with the following Patreon profile</p>
								<strong>{{ userInfo.patreon_email }}</strong>
								<a
									:href="`https://www.patreon.com/user?u=${userInfo.patreon_id}`"
									target="_blank"
									rel="noopener"
									class="btn btn-sm bg-neutral-5 mt-3"
									>View linked profile</a
								>
								<h2 v-if="userInfo.patron" class="mt-3 mb-0 text-bold">
									{{ userInfo.patron?.tier }}
								</h2>
								<strong v-if="userInfo.patron?.expired" class="red">Expired</strong>
								<a
									v-if="!userInfo.patron || userInfo.patron.expired"
									href="https://www.patreon.com/join/shieldmaidenapp"
									target="_blank"
									rel="noopener"
									class="btn btn-block mt-3"
								>
									{{ userInfo.patron?.expired ? "Renew" : "Subscribe" }}
								</a>
							</div>
							<div slot="footer" class="card-footer">
								<router-link
									class="btn bg-neutral-5 mr-2"
									:class="{ 'full-width': success }"
									to="/profile"
								>
									{{ success ? "Back to profile" : "Cancel" }}
								</router-link>
								<button v-if="!success" class="btn bg-red" @click="unLink">
									<hk-icon icon="fas fa-unlink" class="mr-2" /> Unlink account
								</button>
							</div>
						</template>
					</template>
				</hk-card>
				<small v-if="!userInfo.patreon_id && !id_taken"
					>In order to link your accounts, we will save your Patreon user identification ({{
						patreon_user.id
					}}) and email ({{ patreon_user.attributes?.email }}) in your Shieldmaiden user info
				</small>
			</template>
		</div>
	</div>
</template>

<script>
import PatreonLinkButton from "src/components/PatreonLinkButton.vue";
import { db } from "src/firebase";
import { mapGetters, mapActions } from "vuex";

export default {
	name: "LinkPatreonAccount",
	components: {
		PatreonLinkButton,
	},
	data() {
		return {
			loading: true,
			linking: false,
			id_taken: false,
			success: false,
		};
	},
	async preFetch({ store, currentRoute, redirect, ssrContext }) {
		if (ssrContext) {
			console.log("preFetch: I should not be logged on the client side, only server");
			const subdomains = ssrContext.req?.subdomains?.length
				? `${ssrContext.req?.subdomains.join(".")}.`
				: "";
			const origin = `${ssrContext.req?.protocol}://${subdomains}${ssrContext.req?.headers?.host}`;
			if (!store.getters.user) {
				redirect("/sign-in");
			}
			if (currentRoute.query?.code) {
				await store.dispatch(
					"authenticate_patreon_user",
					{ code: currentRoute.query.code, origin },
					{ root: true }
				);
				await store.dispatch("get_patreon_identity", null, { root: true });
			}
		}
	},
	computed: {
		...mapGetters(["user", "userInfo", "patreon_auth", "patreon_user"]),
	},
	async mounted() {
		if (this.patreon_user) {
			await this.checkAvailability();
		}
		this.loading = false;
	},
	methods: {
		...mapActions(["update_userInfo", "setUserInfo", "checkEncumbrance"]),
		async link() {
			this.inking = true;
			await this.checkAvailability();
			if (!this.id_taken && this.patreon_user.id) {
				await this.update_userInfo({
					patreon_id: this.patreon_user.id,
					patreon_email: this.patreon_user.attributes?.email,
				});
				this.success = true;
				await this.setUserInfo(); // directly access benefits
				await this.checkEncumbrance();
			}
			this.linking = false;
		},
		async unLink() {
			this.linking = true;
			await this.update_userInfo({
				patreon_id: null,
				patreon_email: null,
			});
			await this.setUserInfo(); // directly remove benefits access
			await this.checkEncumbrance();
			this.id_taken = false;
			this.linking = false;
		},
		async checkAvailability() {
			const patreon_id_ref = db
				.ref(`users`)
				.orderByChild("patreon_id")
				.equalTo(this.patreon_user.id);
			await patreon_id_ref.once("value", (snapshot) => {
				this.id_taken = snapshot.exists();
			});
		},
	},
};
</script>

<style lang="scss" scoped>
.hk-card.patron-card {
	width: 300px;
	&::v-deep {
		.card-body {
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;

			img {
				width: 100px;
				aspect-ratio: 1/1;
				object-fit: cover;
				object-position: center;
				border-radius: 100%;
				margin-bottom: 15px;
			}
			.name {
				font-size: 18px;
				font-weight: bold;
			}
		}
	}
}
</style>
