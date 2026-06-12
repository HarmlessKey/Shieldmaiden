<template>
	<hk-card>
		<div slot="header" class="card-header">
			Give feedback
			<a class="btn btn-sm bg-discord-purple" href="https://discord.gg/UY63AY8Ae6" rel="noopener" target="_blank">
				<i class="fab fa-discord mr-1" aria-hidden="true" /> Join Discord
			</a>
		</div>
		<div class="card-body">
			<p>
				If you run into an issue with our app, please let us know, whether it's a bug report or a feature request.<br/>
				Our discord is the best place to leave feedback, follow the link below.
			</p>
			<a href="https://discord.gg/UY63AY8Ae6" target="_blank" rel="noopener" class="btn btn-block btn-lg bg-discord-purple">
				<i aria-hidden="true" class="fab fa-discord mr-2"></i> Join Shieldmaiden Discord
			</a>
		</div>
	</hk-card>
</template>

<script>
	import axios from "axios";
	export default {
		name: 'Feedback',
		data() {
			return {
				widget: {}
			}
		},
		methods: {
			async getDiscord() {
				this.widget = await axios.get("https://discord.com/api/guilds/654675574488563714/widget.json");
			}
		},
		mounted() {
			this.getDiscord();
		}
	}
</script>

<style lang="scss" scoped>
	.discord-widget {
		width: 100%;
		height: 400px;
		border-radius: 8px;
	}
</style>