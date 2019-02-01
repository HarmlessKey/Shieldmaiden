<template>
	<div class="grid">
		<div class="container">
			<h1>Updates</h1>
			<p>Check our latest updates on Trello.</p>
			<a href="https://trello.com/b/FGyjhDOt/harmless-key" target="_blank"><i class="fab fa-trello"></i> Harmless Key Trello.</a>

			<!-- <ul class="updates">
				<li v-for="update, index in updates" :key="index">
					<span class="date gray-hover">{{ makeDate(update['.key']) }}</span>
					<a data-toggle="collapse" :href="'#upd-'+update['.key'].toString()" 
						role="button" aria-expanded="false"
						class="d-flex justify-content-between">
						{{ update.title }}
						<span><i class="fas fa-caret-down"></i></span>
					</a>
					<div class="collapse desc bg-gray-darker" :id="'upd-'+update['.key'].toString()">
						{{ update.desc }}
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
		name: 'Updates',
		components: {
			Footer,
		},
		metaInfo: {
			title: 'Updates'
		},
		firebase() {
			return {
				updates: db.ref(`updates`),
			}
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