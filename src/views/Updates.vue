<template>
	<div class="grid">
		<div class="content">
			<h1>Updates</h1>
			<p>Check the latest updates on our Discord.</p>

			<a href="https://discord.gg/gCXJZCs" target="_blank" rel="noopener" class="large-link">
				<div class="icon bg-discord-purple"><i class="fab fa-discord white"></i></div>
				<div class="text">Harmless Key Discord</div>
			</a>
		</div>
		<Footer />
	</div>
</template>

<script>
	import Footer from '@/components/Footer.vue'

	export default {
		name: 'Updates',
		components: {
			Footer,
		},
		metaInfo: {
			title: 'Updates'
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

		ul.updates {
			padding: 0;
			list-style: none;
			margin-bottom: 60px;

			li {
				font-size: 13px;
				border-bottom: solid 1px$gray-active;

				a {
					color: $gray-light !important;
					padding: 15px 5px;
					border-top: solid 1px$gray-active;

					&:hover {
						text-decoration: none;
					}
				}
				.desc {
					padding: 15px;
				}
			}
		}
	}
}
</style>