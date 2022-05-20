<template>
	<span>
		<template v-if="user.uid">
			<a v-if="!following['.value']" @click="follow(true)" class="btn btn-sm btn-clear">
				<i aria-hidden="true" class="fas fa-user-plus mr-1" /> 
				<q-tooltip anchor="bottom middle" self="top middle">
					Follow
				</q-tooltip>
			</a>
			<a v-else @click="follow(false)" class="btn btn-sm btn-clear">
				<i aria-hidden="true" class="fas fa-user-check green" />
				<q-tooltip anchor="bottom middle" self="top middle">
					Unfollow
				</q-tooltip>
			</a>
		</template>
		<i aria-hidden="true" v-else class="fas fa-user" />
	</span>
</template>

<script>
	import { db } from "src/firebase"

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
