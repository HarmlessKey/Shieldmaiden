<template>
	<div v-if="overencumbered" class='container-fluid'>
		<OverEncumbered/>
	</div>
	<div id="hasSide" v-else-if="encounter">
		<Sidebar/>
		<div class="wrapper">
			<div class="top">
				<Crumble />
				<router-link :to="'/encounters/' + $route.params.campid"><i class="fas fa-arrow-left"></i> Back</router-link>
			</div>
			<div class="grid">
				<div class="encounter_actions">
					<div>
						<ul class="nav nav-tabs" id="myTab" role="tablist">
							<li class="nav-item">
								<a class="nav-link active" id="general-tab" data-toggle="tab" href="#general" role="tab" aria-controls="general" aria-selected="true">General</a>
							</li>
							<li class="nav-item">
								<a class="nav-link" id="entities-tab" data-toggle="tab" href="#entities" role="tab" aria-controls="entities" aria-selected="true">Entities</a>
							</li>
							<li class="nav-item">
								<a class="nav-link" id="loot-tab" data-toggle="tab" href="#loot" role="tab" aria-controls="loot" aria-selected="false">
									<i class="fas fa-treasure-chest"></i> Loot
								</a>
							</li>
						</ul>
						<div class="content">
							<div class="tab-content">
								<div class="tab-pane fade show active" id="general" role="tabpanel" aria-labelledby="general-tab">
									<General />
								</div>
								<div class="tab-pane fade" id="entities" role="tabpanel" aria-labelledby="entities-tab">
									<Entities />
								</div>
								<div class="tab-pane fade" id="loot" role="tabpanel" aria-labelledby="loot-tab">
									<Loot />
								</div>
							</div>
						</div>
					</div>	
				</div>

				<!-- ENCOUNTER SUMMARY -->
				<div class="encounter_overview" v-if="encounter">
						<div>
							<h3>
								Difficulty:
								<span v-if="encDifficulty" class="text-capitalize" :class="{ 
									'red': encDifficulty[0] == 'error' || encDifficulty[0] == 'deadly', 
									'orange':  encDifficulty[0] == 'hard', 
									'yellow':  encDifficulty[0] == 'medium', 
									'green':  encDifficulty[0] == 'easy'}">
									{{ encDifficulty[0] }}
								</span>
							</h3>
							<div class="diff-info" v-if="encDifficulty">
								{{ encDifficulty[1] }}
								<template v-if="encDifficulty['easy']">
									<p>
										<b>Party XP tresholds</b><br/>
										<span class="left">Easy:</span> <span :class="{ 'blue': encDifficulty[0] == 'easy'}">{{ encDifficulty['easy'] }}</span><br/>
										<span class="left">Medium:</span> <span :class="{ 'blue': encDifficulty[0] == 'medium'}">{{ encDifficulty['medium'] }}</span><br/>
										<span class="left">Hard:</span> <span :class="{ 'blue': encDifficulty[0] == 'hard'}">{{ encDifficulty['hard'] }}</span><br/>
										<span class="left">Deadly:</span> <span :class="{ 'blue': encDifficulty[0] == 'deadly'}">{{ encDifficulty['deadly'] }}</span>
									</p>
									Total XP: <span class="blue">{{ encDifficulty['totalXp'] }}</span><br/>
									Adjusted XP: <span class="blue">{{ encDifficulty['compare'] }}</span>

									<b-progress 
										:value="encDifficulty['compare']" 
										:max="encDifficulty['deadly']" 
										class="mt-3"
										:variant="bars[encDifficulty[0]]"
										></b-progress>
								</template>
							</div>
							<ul class="entities hasImg mt-4" v-if="encounter">
								<li v-for="(entity, key) in encounter.entities" :key="key" class="d-flex justify-content-between">
									<div class="d-flex justify-content-left">
										<template v-if="entity.entityType == 'player'">
											<span v-if="players[entity.id].avatar" class="img" :style="{ backgroundImage: 'url(\'' + players[entity.id].avatar + '\')' }"></span>
											<img v-else src="@/assets/_img/styles/player.png" class="img" />
										</template>
										<template v-else-if="entity.entityType == 'npc'">
											<span v-if="entity.avatar" class="img" :style="{ backgroundImage: 'url(\'' + entity.avatar + '\')' }"></span>
											<span v-else-if="entity.npc == 'custom' && npcs[entity.id] && npcs[entity.id].avatar" class="img" :style="{ backgroundImage: 'url(\'' + npcs[entity.id].avatar + '\')' }"></span>
											<img v-else-if="entity.friendly" src="@/assets/_img/styles/player.png" class="img" />
											<img v-else src="@/assets/_img/styles/monster.png" class="img" />
										</template>
										<span class="green" :class="{ 'red': entity.entityType == 'npc' && !entity.friendly }">
											{{ entity.name }}
										</span>
									</div>
									<div class="actions">
										<a v-if="entity.entityType == 'npc'" @click="setSlide({show: true, type: 'slides/Edit', data: entity })" class="mr-2 gray-hover" v-b-tooltip.hover title="Edit">
											<i class="fas fa-pencil"></i>
										</a>
										<a class="gray-hover" v-b-tooltip.hover title="Remove Character" @click="remove(key, entity.name)">
											<i class="fas fa-minus"></i>
										</a>
									</div>
									<i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
								</li>
							</ul>
							<div v-else class="loader"><span>Loading entities...</span></div>
						</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/crumble/MyContent.vue'
	import Loot from './Loot.vue'
	import Entities from './Entities.vue'
	import General from './General.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'

	import _ from 'lodash'

	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'
	import { difficulty } from '@/mixins/difficulty.js'
	import { dice } from '@/mixins/dice.js'
	import { attributes } from '@/mixins/attributes.js'

	export default {
		name: 'EditCampaign',
		mixins: [difficulty, attributes, dice],
		metaInfo: {
			title: 'Encounters'
		},
		components: {
			Sidebar,
			Crumble,
			OverEncumbered,
			Loot,
			Entities,
			General
		},
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.getUser,
				
				encDifficulty: undefined,
				
				bars: {
					trivial: 'secondary',
					easy: 'success',
					medium: 'warning',
					hard: 'info',
					deadly: 'danger',
				}
			} 
		},
		computed: {
			...mapGetters([
				'encounter',
				'campaign',
				'players',
				'npcs',
				'overencumbered',
			]),
			// eslint-disable-next-line
			async _excludeFriendlies() {
				if(this.encounter) {
					// eslint-disable-next-line
					var entities = await _.chain(this.encounter.entities)
									.filter(function(entity, key) {
										entity.key = key
										return !entity.friendly;
									})
									.sortBy('name' , 'asc')
									.value();

					return entities;
				}
			}
		},
		watch: {
			_excludeFriendlies() {
				this.setDifficulty()
			}
		},
		mounted() {
			this.fetchEncounter({
				cid: this.campaignId, 
				eid: this.encounterId, 
			}),
			this.fetchCampaign({
				cid: this.campaignId, 
			})
		},
		methods: {
			...mapActions([
				'fetchEncounter',
				'fetchCampaign',
				'setSlide'
			]),
			remove(id) {
				db.ref('encounters/' + this.user.uid + '/' + this.campaignId + '/' + this.encounterId + '/entities').child(id).remove();
			},
			async setDifficulty() {
				this.encDifficulty = await this.difficulty(this.encounter.entities)
			},
		}
	}
</script>

<style lang="scss" scoped>
.wrapper {
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 100px 1fr;
	height: calc(100vh - 50px);

	.top {
		padding: 20px;
	}

	.grid {
		padding: 20px;
		display: grid;
		grid-template-columns: 1fr 400px;
		grid-gap: 10px;
		overflow: hidden;

		

		.encounter_actions {
			.content {
				padding: 15px;
				background: #302f2f !important;

				.tab-content {
					height: calc(100vh - 260px);
					overflow-y: scroll;

					&::-webkit-scrollbar {
						display: none;
					}
				}
			}
		}
		.encounter_overview {
			padding: 10px;
			background: rgba(38, 38, 38, .9);
			height: calc(100vh - 190px);
			overflow-y: scroll;

			&::-webkit-scrollbar {
				display: none;
			}
		}
	}
}
ul.nav {
	a.nav-link {
		&.active {
			background: #302f2f !important;
		}
	}
}



.diff-info {
	background: #302f2f;
	padding: 10px;
	margin-top: 10px;

	span.left {
		width: 80px;
		display: inline-block;
	}

	.progress {
		background-color: #232323 !important;
	}
}


// Remove arrows from number field
input[type="number"]::-webkit-outer-spin-button, input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
 
input[type='number'] {
    -moz-appearance: textfield;
}


.npc {
	padding: 15px;
	position: fixed;
	right: 0;
	top: 50px;
	height: calc(100vh - 50px);
	width: 330px;
	z-index: 99;
	overflow: auto;
	border-left: solid 1px #000;
	box-shadow: 0 10px 8px #000;
}
.faded {
	opacity: .3;
}

</style>