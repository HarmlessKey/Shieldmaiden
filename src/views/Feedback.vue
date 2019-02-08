<template>
<div class="grid">
	<div class="container">
		<h1>Give feedback</h1>
		<p>If you run into an issue with our app, please let us know. You can leave feedback on GitHub.</p>
		<a href="https://github.com/HarmlessHarm/HarmlessKey/issues/new" target="_blank"><i class="fab fa-github"></i> Harmless Key GitHub.</a>
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

	.container {
		padding-top: 30px;
		padding-bottom: 50px;
		line-height: 25px;
		font-size: 15px; 
		font-weight: lighter;
	}
}
</style>