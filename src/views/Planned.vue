<template>
<div class="container">
	<h2>Planned updates</h2>
	<ul class="updates">
		<li>
			<a data-toggle="collapse" href="#reset" 
				role="button" aria-expanded="false"
				class="d-flex justify-content-between">
				Reset an encounter
				<span><i class="fas fa-caret-down"></i></span>
			</a>
			<div class="collapse desc bg-gray-darker" id="reset">
				We will make it possible to reset an encounter that was finished.
			</div>
		</li>
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
		
	</ul>
</div>
</template>

<script>
	import { db } from '@/firebase'

	export default {
		name: 'Planned',
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
</style>