<template>
	<div header="Link your Patreon account">
		{{ patreon_auth?.access_token }}
		<hk-loader v-if="loading" />
		<div v-else class="card-body d-flex flex-col items-center">
			<template v-if="!patreon_auth">
				<p v-if="$route.query?.code">
					Something went wrong while fetching your Patreon account, please try again.
				</p>
				<PatreonLinkButton />
			</template>
			<template v-else-if="patreon_user">
				<hk-card class="patron-card">
					<template v-if="!userInfo.patreon_id">
						<div class="card-body">
							<img :src="patreon_user.attributes?.thumb_url" />
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
							<span v-if="success" class="full-width text-center green"
								>Account successfully linked</span
							>
							<button v-else-if="!id_taken" class="btn btn-block" @click="link">
								<hk-icon icon="fas fa-link" class="mr-2" /> Link account
							</button>
							<span v-else class="full-width text-center">This account is already linked</span>
						</div>
					</template>
					<template v-else>
						<div class="card-body">
							<p>Your account is already linked with Patreon</p>
							<a
								:href="`https://www.patreon.com/user?u=${userInfo.patreon_id}`"
								target="_blank"
								rel="noopener"
								class="btn btn-sm bg-neutral-5 mt-3"
								>View linked profile</a
							>
						</div>
						<div slot="footer" class="card-footer">
							<button class="btn btn-block bg-red" @click="unLink">
								<hk-icon icon="fas fa-unlink" class="mr-2" /> Unlink account
							</button>
						</div>
					</template>
				</hk-card>
				<small
					>In order to link your accounts, all we do is save your Patreon user identification ({{
						patreon_user.id
					}}) in your Shieldmaiden user info</small
				>
				<hk-card>
					<pre>{{ patreon_user }}</pre>
				</hk-card>
			</template>
		</div>
	</div>
</template>

<script>
import PatreonLinkButton from "src/components/PatreonLinkButton.vue";
import { db } from "src/firebase";
import { mapGetters } from "vuex";

export default {
	name: "LinkPatreonAccount",
	components: {
		PatreonLinkButton,
	},
	data() {
		return {
			loading: false,
			id_taken: false,
			success: false,
		};
	},
	async preFetch({ store, currentRoute }) {
		if (currentRoute.query?.code) {
			await store.dispatch("authenticate_patreon_user", currentRoute.query.code, { root: true });
			await store.dispatch("get_patreon_identity", null, { root: true });
		}
	},
	computed: {
		...mapGetters(["user", "userInfo", "patreon_auth", "patreon_user"]),
	},
	async mounted() {
		if (this.patreon_user) {
			await this.checkAvailability();
		}
	},
	methods: {
		async link() {
			await this.checkAvailability();
			if (!this.id_taken && this.patreon_user.id) {
				await db.ref(`users/${this.user.uid}`).child("patreon_id").set(this.patreon_user.id);
				this.success = true;
			}
		},
		async unLink() {
			db.ref(`users/${this.user.uid}`).child("patreon_id").set(null);
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
