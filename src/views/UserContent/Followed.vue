<template>
	<hk-card header="Followed users">
		<div class="card-body" v-if="!loading">
			<ul v-if="followed" class="entities">
				<li v-for="(followed, key) in followed" :key="key" class="d-flex justify-content-between">
					<router-link :to="`/user/${key}`">
						{{ followed.capitalize() }}
					</router-link>
				</li>
			</ul>
			<p v-else>You are currently not following other users.</p>
		</div>
		<hk-loader v-else name="users" />
	</hk-card>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import Crumble from "@/components/crumble";

	export default {
		name: 'Followed',
		components: {
			Crumble
		},
		data() {
			return {
				loading: true
			}
		},
		computed: {
			...mapGetters([
				"followed",
			]),
		},
		async mounted() {
			await this.get_followed();
			this.loading = false;
		},
		methods: {
			...mapActions(["get_followed"]),
		},
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