<template>
	<div class="follow neutral-2">
		<div v-if="user.uid">
			<small v-if="!following['.value']">
				Follow user
				<a @click="follow(true)" class="btn btn-sm bg-neutral-5">
					<i class="fas fa-user-plus mr-1"></i> 
				</a>
			</small>
			<small v-else>
				<div class="d-none d-md-inline mr-2">Following user</div>
				<a @click="follow(false)" class="btn btn-sm bg-neutral-5
				">
					<i class="fas fa-user-check green"></i> 
				</a>
			</small>
		</div>
		<small v-else>
			<router-link to="/sign-in">Sign in to follow</router-link>
		</small>
	</div>
</template>

<script>
	import { db } from "@/firebase"

	export default {
		name: "Follow",
		props: [
			"entity",
		],
		data() {
			return {
				user: this.$store.getters ? this.$store.getters.user : undefined,
				dmId: this.$route.params.userid,
			}
		},
		firebase() {
			return {
				following: {
					source: db.ref(`users/${this.user.uid}/follow/${this.dmId}`),
					asObject: true,
				},
			}
		},
		methods: {
			follow(value) {
				if(value) {
					db.ref(`users/${this.user.uid}/follow/${this.dmId}`).set(true)
				} else {
					db.ref(`users/${this.user.uid}/follow/${this.dmId}`).remove()
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
</style>
