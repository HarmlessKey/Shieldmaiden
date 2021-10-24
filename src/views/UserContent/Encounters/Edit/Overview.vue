<template>
	<div>
		<div class="encounter_overview" :class="{ show: showOverview }">
			<div>
				<h3 class="header">Encounter overview</h3>
				<div class="diff-info" v-if="encDifficulty">
					<h5 class="mb-3">Difficulty</h5>
					<div class="d-flex justify-content-between">
						<div class="advanced">
							{{ encDifficulty[1] }}
							<template v-if="encDifficulty['easy']">
								<div class="mb-3">
									<div><b>Party XP tresholds</b></div>
									<div :class="{ 'green': encDifficulty[0] === 'easy'}">
										<span class="left">Easy:</span> <hk-animated-integer :value="encDifficulty['easy']"/>
									</div>
									<div :class="{ 'yellow': encDifficulty[0] === 'medium'}">
										<span class="left">Medium:</span> <hk-animated-integer :value="encDifficulty['medium']"/>
									</div>
									<div :class="{ 'orange': encDifficulty[0] === 'hard'}">
										<span class="left">Hard:</span> <hk-animated-integer :value="encDifficulty['hard']"/>
									</div>
									<div :class="{ 'red': encDifficulty[0] === 'deadly'}">
										<span class="left">Deadly:</span> <hk-animated-integer :value="encDifficulty['deadly']"/>
									</div>
								</div>
								Total XP: <hk-animated-integer :value="encDifficulty['totalXp']" class="blue" /><br/>
								Adjusted XP: <hk-animated-integer :value="encDifficulty['compare']" class="blue" />
							</template>
						</div>
						<q-circular-progress
							class="d-none d-lg-block"
							show-value
							font-size="18px"
							:value="encDifficulty['compare']/encDifficulty['deadly']*100"
							size="165px"
							:color="bars[encDifficulty[0]]"
							track-color="dark"
						>
							{{ encDifficulty[0].capitalize() }}
						</q-circular-progress>
					</div>
					<div class="progress-area d-block d-lg-none">
						<q-linear-progress 
							size="20px" 
							:value="encDifficulty['compare']/encDifficulty['deadly']" 
							:color="bars[encDifficulty[0]]" 
							class="q-mt-sm" 
						/>
						<span 
							class="diff"
							:class="{ 
								'green': encDifficulty[0] == 'easy',
								'yellow': encDifficulty[0] == 'medium',
								'orange': encDifficulty[0] == 'hard',
								'red': encDifficulty[0] == 'deadly'
							}"
						>
							{{ encDifficulty[0] }}
						</span>
					</div> 
					<hr class="mb-0">
				</div>
				<h3 v-else class="neutral-3">Calculating difficulty...</h3>
			</div>
			<q-scroll-area :dark="$store.getters.theme === 'dark'" class="bg-neutral-6" :thumb-style="{ width: '5px'}">
				<div class="overview">          
					<template v-if="encounter">
						<h3>{{ Object.keys(_friendlies).length }} Players and friendlies</h3>

						<hk-table
							class="mb-4" 
							:items="_friendlies"
							:columns="entityColumns"
							:showHeader="false"
						>
							<div slot="image" slot-scope="data">
								<!-- Player avatar -->
								<span 
									v-if="data.row.entityType === 'player'" 
									:style="{ backgroundImage: 'url(\'' + players[data.row.id].avatar + '\')' }"
									class="image"
								>
									<i v-if="!players[data.row.id].avatar" class="hki-player" />
								</span>

								<!-- Companion avatar -->
								<span v-if="data.row.entityType === 'companion'" :style="{ backgroundImage: 'url(\'' + npcs[data.row.id].avatar + '\')' }">
									<i v-if="!npcs[data.row.id].avatar" class="hki-companion" />
								</span>

								<!-- Friendly NPC avatar -->
								<span 
									v-else-if="data.row.entityType === 'npc'"
									class="image" 
									:style="{ 
										backgroundImage: 'url(\'' + data.row.avatar || npcs[data.row.id].avatar + '\')', 
										'border-color': data.row.color_label ? data.row.color_label : ``,
										'color': data.row.color_label ? data.row.color_label : ``
									}"
								>
									<i v-if="!data.row.avatar && (!npcs[data.row.id] || !npcs[data.row.id].avatar)" class="hki-monster" />
								</span>
							</div>

							<!-- NAME -->
							<span slot="name" slot-scope="data" class="green">
								{{ data.item.capitalizeEach() }}
							</span>

							<!-- ACTIONS -->
							<div slot="actions" slot-scope="data" class="actions">
								<a v-if="data.row.entityType === 'npc'" 
									@click="setSlide({show: true, type: 'slides/editEncounter/EditEntity', data: data.row })" 
									class="mr-2 btn btn-sm bg-neutral-5" 
								>
									<i class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</a>
								<a class="btn btn-sm bg-neutral-5" @click="remove(data.row.key, data.row.name)">
									<i class="fas fa-minus"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Remove character
									</q-tooltip>
								</a>
							</div>
						</hk-table>

						<h3>{{ Object.keys(_monsters).length }} Monsters</h3>

						<hk-table 
							:items="_monsters"
							:columns="entityColumns"
							:showHeader="false"
						>
							<span 
								slot="image" 
								slot-scope="data"
								class="image" 
								:style="{ 
									backgroundImage: 'url(\'' + data.row.avatar || npcs[data.row.id].avatar + '\')', 
									'border-color': data.row.color_label ? data.row.color_label : ``,
									'color': data.row.color_label ? data.row.color_label : ``
								}"
							>
								<i v-if="!data.row.avatar && (!npcs[data.row.id] || !npcs[data.row.id].avatar)" class="hki-monster" />
							</span>

							<!-- NAME -->
							<span slot="name" slot-scope="data" class="red">
								{{ data.item.capitalizeEach() }}
							</span>

							<div slot="actions" slot-scope="data" class="actions">
								<a @click="setSlide({show: true, type: 'slides/editEncounter/EditEntity', data: data.row })" class="mr-2 btn btn-sm bg-neutral-5">
								<q-tooltip anchor="top middle" self="center middle">
									Edit
								</q-tooltip>
									<i class="fas fa-pencil"></i>
								</a>
								<a class="btn btn-sm bg-neutral-5" @click="remove(data.row.key, data.row.name)">
									<i class="fas fa-minus"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Remove character
									</q-tooltip>
								</a>
							</div>
						</hk-table>
					</template>
					<div v-else class="loader"><span>Loading entities...</span></div>
				</div>
			</q-scroll-area>
		</div>
		<div class="toggle bg-blue" :class="{ show: showOverview }"  @click="showOverview = !showOverview">
			<i class="fas fa-chevron-left"></i>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import { difficulty } from '@/mixins/difficulty.js';
import hkAnimatedInteger from '../../../../components/hk-components/hk-animated-integer.vue';

	export default {
  components: { hkAnimatedInteger },
		name: 'Overview',
		mixins: [difficulty],
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.user,
				slide: this.$store.getters.getSlide,
				showOverview: false,
				encDifficulty: undefined,
				bars: {
					trivial: 'grey',
					easy: 'positive',
					medium: 'info',
					hard: 'warning',
					deadly: 'negative',
				},
				entityColumns: {
					image: {
					width: 46,
						noPadding: true
					},
					name: {
						truncate: true
					},
					actions: {
						noPadding: true,
						maxContent: true
					}
				}
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
			},
			_friendlies() {
				if(this.encounter) {
					// eslint-disable-next-line
					return _.chain(this.encounter.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.friendly || entity.entityType === 'player' || entity.entityType === 'companion';
					})
					.orderBy(function(entity) {
						return entity.name
					}, 'asc')
					.value()
				}
			},
			_monsters() {
				if(this.encounter) {
					// eslint-disable-next-line
					return _.chain(this.encounter.entities)
					.filter(function(entity, key) {
						entity.key = key
						return !entity.friendly && entity.entityType === 'npc';
					})
					.orderBy(function(entity) {
						return entity.name
					}, 'asc')
					.value()
				}
			},
			totalXp() {
				return this.encDifficulty['totalXp'];
			}
		},
		watch: {
			_excludeFriendlies() {
				this.setDifficulty()
			}
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
				this.encDifficulty = await this.difficulty(this.encounter.entities);

				//Store the new xp value for the encounter
				db.ref('encounters/' + this.user.uid + '/' + this.campaignId + '/' + this.encounterId + '/xp/calculated').set(this.encDifficulty['totalXp']);
			},
		}
	}
</script>

<style lang="scss" scoped>
	.encounter_overview {
		height: 100%;
		grid-area: overview;
		overflow-y: hidden;

		h3 {
			margin-bottom: 10px;
		}
		.diff-info {
			background: $neutral-6;
			padding: 10px 10px 0 10px;

			span.left {
				width: 80px;
				display: inline-block;
			}

			.progress-area {
				.progress {
					background-color: $neutral-8 !important;
				}
				.diff {
					display: none;
				}
			}
		}
		.q-scrollarea {
			height: calc(100% - 290px) !important;

			.overview {
				padding: 15px 10px 30px 10px;
			}
		}
	}
	.toggle {
		display: none
	}
	@media only screen and (max-width: 850px) {
		.encounter_overview {
			position: fixed;
			top: 50px;
			right: -300px; 
			height: calc(100vh - 50px);
			overflow: scroll;
			z-index: 96;
			background: $neutral-6;
			overflow: scroll;
			width: 300px;
			transition: right .5s linear,
			box-shadow .5s linear;

			&.show {
				right: 0;
				box-shadow: 0 10px 15px$black;
			}

			h3.header {
				padding: 10px;
			}

			.q-scrollarea {
				overflow: visible !important;
				height: calc(100% - 286px);
			}

			&::-webkit-scrollbar {
				display: none;
			}
		} 
		.toggle {
			position: fixed;
			top: 65px;
			right: 0;
			height: 50px;
			width: 50px;
			z-index: 97;
			text-align: center;
			transition: right .5s linear;
			display: block;
			cursor: pointer;
			line-height: 50px;
			color:$neutral-1 !important;

			i {
				transition: transform .5s linear;
			}    

			&.show {
				right: 300px;

				i {
					transform: rotate(180deg);
				}
			}
		}   
	}
</style>