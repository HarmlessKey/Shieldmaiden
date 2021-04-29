<template>
	<div class="follow d-flex justify-content-end">
		<div v-if="user.uid" class="pr-2">
			<small v-if="!following['.value']">
				<i class="fas fa-user-plus mr-1"></i> 
				<a @click="follow(true)">Follow user</a>
			</small>
			<small v-else>
				<span class="show"><i class="fas fa-user-check green"></i> Following user</span>
				<a class="hover-show" @click="follow(false)"><i class="fas fa-user-minus red"></i> Unfollow</a>
			</small>
		</div>
		<small v-else>
			<router-link to="/sign-in">Sign in to follow</router-link>
		</small>
	</div>
</template>

<script>
	import { db } from '@/firebase'

	export default {
		name: 'Follow',
		props: [
			'entity',
		],
		data() {
			return {
				user: this.$store.getters.user,
				userId: this.$route.params.userid,
			}
		},
		firebase() {
			return {
				following: {
					source: db.ref(`users/${this.user.uid}/follow/${this.userId}`),
					asObject: true,
				},
			}
		},
		methods: {
			follow(value) {
				if(value) {
					db.ref(`users/${this.user.uid}/follow/${this.userId}`).set(true)
				} else {
					db.ref(`users/${this.user.uid}/follow/${this.userId}`).remove()
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
	.follow {
		color:$white;

		.hover-show {
			display: none;
		}
		&:hover {
			.hover-show {
				display: inline;
			}
			.show {
				display: none;
			}
		}
	}
</style>
