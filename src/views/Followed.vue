<template>
<div>
	<div class="container">
		<h2>Followed Users</h2>
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
</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapGetters } from 'vuex'

	export default {
		name: 'home',
		metaInfo: {
			title: 'Followed Users',
		},
		data() {
			return {
				following: []
			}
		},
		async mounted() {
			for(const key in this.userInfo.follow) {
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
		},
		computed: {
			...mapGetters([
				'userInfo',
			]),
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding-top: 30px;

		ul.entities {
			li {
				.live {
					line-height: 20px;
					padding: 0px 10px;
				}
				i {
					margin-top: 5px;
				}
			}
		}
	}
</style>