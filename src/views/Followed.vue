<template>
<div>
	<div class="container">
		<h2>Followed Users</h2>
		<template v-if="userInfo && users">
			<ul v-if="userInfo.follow" class="entities">
				<li v-for="(following, key) in userInfo.follow" :key="key" class="d-flex justify-content-between">
					<router-link :to="'/user/' + key" v-if="users[key]">
						{{ users[key].username }}
					</router-link>
					<template v-if="track[key]">
						<i v-show="track[key].broadcast" v-b-tooltip.hover title="Broadcasting" class="fas fa-play green"></i>
						<i v-show="!track[key].broadcast" v-b-tooltip.hover title="Not Broadcasting" class="fas fa-stop red"></i>
					</template>
				</li>
			</ul>
			<p v-else>You are currently not following other users.</p>
		</template>
	</div>
</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'home',
		metaInfo: {
			title: 'Followed Users',
		},
		firebase() {
			return {
				users: {
					source: db.ref(`users`),
					asObject: true
				},
				track: {
					source: db.ref(`track`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
			]),
		},
		methods: {
		
		},
	}
</script>

<style lang="scss" scoped>
	.container {
		padding-top: 30px;

		ul.entities {
			li {
				i {
					margin-top: 5px;
				}
			}
		}
	}
</style>