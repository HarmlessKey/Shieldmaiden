<template>
	<div class="container">	
		<h2 class="text-center head">Encounter Finished</h2>

		<div class="card finished">
			<div class="card-header"><i class="fas fa-treasure-chest"></i> Loot</div>
			<div class="card-body">
				<template v-if="encounter.loot">
					<template v-if="encounter.loot.gp || encounter.loot.sp || encounter.loot.cp">
						<h3 class="text-center">Currency</h3>
						<div class="currency d-flex justify-content-center">
							<div v-if="encounter.loot.gp" class="mr-3">
								<span class="coins yellow"><i class="fas fa-coins"></i></span><br/>
								{{ encounter.loot.gp}}<span class="cur gray-hover">gp</span>
							</div>
							<div v-if="encounter.loot.sp" class="mr-3">
								<span class="coins"><i class="fas fa-coins"></i></span><br/>
								{{ encounter.loot.sp}}<span class="cur gray-hover">sp</span>
							</div>
							<div v-if="encounter.loot.cp" class="mr-3">
								<span class="coins orange"><i class="fas fa-coins"></i></span><br/>
								{{ encounter.loot.cp}}<span class="cur gray-hover">cp</span>
							</div>
						</div>
					</template>
					
					<template v-if="encounter.loot.items">
						<h3 class="text-center">Items</h3>
						<ul>
							<li v-for="(item, index) in encounter.loot.items" :key="index" class="d-flex justify-content-start">
								<span class="icon"><i class="fas fa-ring"></i></span>

								<span>
									<h3>{{ item.name }}</h3>
									<p>{{ item.desc }}</p>
								</span>
							</li>
						</ul>
					</template>
				</template>
				<h2 v-else class="red"><i class="fas fa-times"></i> No loot</h2>
			</div>
			<router-link v-if="$route.name == 'RunEncounter'" class="btn btn-block" :to="'/encounters/' + $route.params.campid">Return to overview</router-link>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'app',
		props: [
			'encounter'
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
			}
		},
	}
</script>

<style lang="scss" scoped>
	.container {
		max-width: 400px;

		h2.head {
			color: #fff;
			margin-top: 20px;
			text-shadow: 0 0 8px #000;
			font-size: 25px !important;
		}

		.finished {
			background: rgba(38, 38, 38, .9) !important;

			.currency {
				text-align: center;
				font-size: 20px;
				margin-bottom: 30px;

				span.cur {
					font-size: 15px;
				}
			}
			ul {
				padding: 0;
				list-style: none;
				border-top: solid 1px #000;

				li {
					padding: 10px 0;
					border-bottom: solid 1px #000;

					h3 {
						margin-bottom: 5px !important;
					}
					p {
						margin-bottom: 0;
					}
					.icon {
						background: rgba(0, 0, 0, .8) !important;
						display: block;
						height: 40px;
						width: 40px;
						line-height: 40px;
						border: solid 1px #fff;
						font-size: 20px;
						margin-right: 20px;
						text-align: center;
					}
				}
			}
		}
	}
</style>
