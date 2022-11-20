<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1>Updates</h1>
		</div>
		<hk-loader name="releases" v-if="loading" />
		<div v-else class="card-body">
			{{ releases }}
		</div>
	</hk-card>
</template>

<script>
	// import { Octokit } from "octokit";
	// const octokit = new Octokit();

	export default {
		name: 'Updates',
		data() {
			return {
				loading: true,
				releases: []
			}
		},
		async mounted() {
			// this.releases = await octokit.request('GET /repos/{owner}/{repo}/releases', {
			// 	owner: 'HarmlessKey',
			// 	repo: 'HarmlessKey'
			// }).catch((e) => {
			// 	console.log(e)
			// });
			// this.loading = false;
		}
	}
</script>