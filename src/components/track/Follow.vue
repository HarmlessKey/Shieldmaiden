<template>
	<div class="follow d-flex justify-content-end">
		<div v-if="user.uid" class="pr-2">
			<small v-if="!following['.value']" class="bg-gray p-2">
				<i class="fas fa-user-plus mr-1"></i> 
				<a @click="follow(true)">Follow campaign</a>
			</small>
			<small v-else class="shadow">
				<span class="show"><i class="fas fa-user-check green"></i> Following campaign</span>
				<a class="hover-show" @click="follow(false)"><i class="fas fa-user-minus red"></i> Unfollow</a>
			</small>
		</div>
		<small v-else class="bg-gray p-2">
			<router-link to="/sign-in">Sign in to follow</router-link>
		</small>
	</div>
</template>

<script>
	import { db } from '@/firebase'

	export default {
		name: 'Health',
		props: [
			'entity',
		],
		data() {
			return {
				user: this.$store.getters.getUser,
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
		color: #fff;

		.shadow {
			text-shadow: 0 0 8px #000;
		}
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
