<template>
<div class="content">
	<Crumble />
	<hk-card header="Followed users">
		<div class="card-body">
			<template v-if="userInfo">
				<ul v-if="following" class="entities">
					<li v-for="(followed, index) in following" :key="index" class="d-flex justify-content-between">
						<router-link :to="'/user/' + followed.key">
							{{ followed.username }}
						</router-link>
						<template v-if="followed.live">
							<span class="live" :class="{ 'active': followed.live }">Live</span>
						</template>
					</li>
				</ul>
				<p v-else>You are currently not following other users.</p>
			</template>
			<div v-else class="loader"><span>Loading Followed Users...</span></div>
		</div>
	</hk-card>
</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapGetters } from 'vuex';
	import Crumble from "../components/crumble";

	export default {
		name: 'home',
		metaInfo: {
			title: 'Followed Users',
		},
		components: {
			Crumble
		},
		data() {
			return {
				following: []
			}
		},
		mounted() {
			this.setFollowed();
		},
		methods: {
			async setFollowed() {
				const userInfo = this.userInfo || {};
				for(const key in userInfo.follow) {
					let user = {};
					user.key = key;

					let getUser = db.ref(`users/${key}`);
					user.username = await getUser.once('value').then(function(snapshot) {
						return snapshot.val().username
					});

					let broadcasting = db.ref(`broadcast/${key}/live`);
					user.live = await broadcasting.once('value').then(function(snapshot) {
						return snapshot.val()
					});

					this.following.push(user);
				}
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
			]),
		}
	}
</script>

<style lang="scss" scoped>
	ul.entities {
		li {
			padding: 10px;

			a {
				line-height: 25px;
			}
		}
	}
</style>