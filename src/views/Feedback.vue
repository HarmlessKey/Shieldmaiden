<template>
<div class="grid">
	<div class="content">
		<h1>Give feedback</h1>
		<p>If you run into an issue with our app, please let us know, whether it's a bug report or a feature request. Our discord is the best place to leave feedback, follow the link below.</p>
		<a href="https://discord.gg/fhmKBM7" target="_blank" class="large-link"><i class="fab fa-discord discord-purple"></i> Harmless Key Discord</a>
	</div>
	<Footer />
</div>
</template>

<script>
	import Footer from '@/components/Footer.vue'

	export default {
		name: 'Feedback',
		components: {
			Footer,
		},
		metaInfo: {
			title: 'Feedback'
		},
	}
</script>

<style lang="scss" scoped>
.grid {
	background-size: cover;
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"container"
	"footer";

	.content {
		padding-bottom: 50px;
		line-height: 25px;
		font-size: 15px; 
		font-weight: lighter;
	}
}
</style>