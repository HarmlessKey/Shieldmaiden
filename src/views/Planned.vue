<template>
<div class="grid">
	<div class="container">
		<h1>Planned updates</h1>
		<p>Follow our planned updates on Trello.</p>

		<a href="https://trello.com/b/FGyjhDOt/harmless-key" target="_blank"><i class="fab fa-trello"></i> Harmless Key Trello.</a>

		<!-- <ul class="updates">
			<li>
				<a data-toggle="collapse" href="#difficulty" 
					role="button" aria-expanded="false"
					class="d-flex justify-content-between">
					Encounter difficulty
					<span><i class="fas fa-caret-down"></i></span>
				</a>
				<div class="collapse desc bg-gray-darker" id="difficulty">
					The difficulty of an encounter will be calculated based on the amount of players and their levels, amount of monsters and the monsters challenge ratings.
				</div>
			</li>
		</ul> -->
	</div>
	<Footer />
</div>
</template>

<script>
	import { db } from '@/firebase'
	import Footer from '@/components/Footer.vue'

	export default {
		name: 'Planned',
		components: {
			Footer,
		},
		metaInfo: {
			title: 'Planned'
		},
		methods: {
			makeDate(input) {
				var monthNames = [
					"January", "February", "March",
					"April", "May", "June", "July",
					"August", "September", "October",
					"November", "December"
				];

				var d = new Date(input*1000)
				var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
				var date = d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
				return date + " - " + time;
			},
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