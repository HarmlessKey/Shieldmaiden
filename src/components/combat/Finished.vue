<template>
	<div class="container">	
		<!-- <h2 class="text-center head">Encounter Finished</h2> -->
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
						<h3><i class="fas fa-wand-magic"></i> Items</h3>
						<ul class="entities hasImg">
							<li v-for="(item, index) in encounter.loot.items" :key="index">
								<span class="img"><i class="fas fa-ring"></i></span>

								<span>
									<h4>{{ item.name }}</h4>
									{{ item.desc }}
								</span>
							</li>
						</ul>
					</template>
				</template>
				<h2 v-else class="red"><i class="fas fa-times"></i> No loot</h2>
			</div>
			<router-link v-if="$route.name == 'RunEncounter'" class="btn btn-block" :to="'/encounters/' + $route.params.campid">Return to overview</router-link>
		</div>
		<b-row v-if="$route.name == 'RunEncounter'">
			<b-col sm="8">
				<b-card header="Damage Meters">
					<Dmg />
				</b-card>
			</b-col>
			<b-col sm="4">
				<b-card header="Combat Log">
					<Log />
				</b-card>
			</b-col>
		</b-row>
	</div>
</template>

<script>
	import Dmg from '@/components/combat/side/Dmg.vue';
	import Log from '@/components/combat/side/Log.vue';

	export default {
		name: 'app',
		props: [
			'encounter'
		],
		components: {
			Dmg,
			Log
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
			}
		},
	}
</script>

<style lang="scss" scoped>
	.container {

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
			ul.entities {
				.img {
					background: none;
					border: none;
					font-size: 25px;
					padding: 8px 15px;
				}
				h4 {
					font-size: 20px;
					margin-bottom: 5px;
				}
			}
		}
	}
</style>
