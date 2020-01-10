<template>
<div class="grid">
	<div class="content">
		<h1>Planned updates</h1>
		<p>Follow our planned updates on Trello.</p>

		<a href="https://trello.com/b/FGyjhDOt/harmless-key" target="_blank" class="large-link">
			<div class="icon"><i class="fab fa-trello"></i></div>
			<div class="text">Harmless Key Trello.</div>
		</a>
	</div>
	<Footer />
</div>
</template>

<script>
	import Footer from '@/components/Footer.vue'

	export default {
		name: 'Planned',
		components: {
			Footer,
		},
		metaInfo: {
			title: 'Planned'
		}
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
				border-bottom: solid 1px #302f2f;

				a {
					color: #b2b2b2 !important;
					padding: 15px 5px;
					border-top: solid 1px #302f2f;

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