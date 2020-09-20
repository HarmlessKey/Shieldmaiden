<template>
	<div>
		<div class="encounter_overview" :class="{ show: showOverview }">
			<div>
				<h3 class="header">Encounter overview</h3>
				<div class="diff-info" v-if="encDifficulty">
					<div class="advanced">
						{{ encDifficulty[1] }}
						<template v-if="encDifficulty['easy']">
							<p>
								<b>Party XP tresholds</b><br/>
								<span :class="{ 'green': encDifficulty[0] == 'easy'}"><span class="left">Easy:</span> <span>{{ encDifficulty['easy'] }}</span></span><br/>
								<span :class="{ 'yellow': encDifficulty[0] == 'medium'}"><span class="left">Medium:</span> <span>{{ encDifficulty['medium'] }}</span></span><br/>
								<span :class="{ 'orange': encDifficulty[0] == 'hard'}"><span class="left">Hard:</span> <span>{{ encDifficulty['hard'] }}</span></span><br/>
								<span :class="{ 'red': encDifficulty[0] == 'deadly'}"><span class="left">Deadly:</span> <span>{{ encDifficulty['deadly'] }}</span></span>
							</p>
							Total XP: <span class="blue">{{ encDifficulty['totalXp'] }}</span><br/>
							Adjusted XP: <span class="blue">{{ encDifficulty['compare'] }}</span>
						</template>
					</div>
					<div class="progress-area">
						<b-progress 
							:value="encDifficulty['compare']" 
							:max="encDifficulty['deadly']" 
							class="mt-3"
							:variant="bars[encDifficulty[0]]"
						></b-progress>
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
			<h3 v-else class="gray-hover">Calculating difficulty...</h3>
		</div>
		<div class="scroll bg-gray-active" v-bar>
			<div>
				<div class="overview">          
					<template v-if="encounter">
						<h3>{{ Object.keys(_friendlies).length }} Players and friendlies</h3>

						<hk-table
							class="mb-4" 
							:items="_friendlies"
							:columns="entityColumns"
							:showHeader="false"
						>
						<template slot="image" slot-scope="data">
							<template v-if="data.row.entityType === 'player'">
								<span v-if="players[data.row.id].avatar" class="image" :style="{ backgroundImage: 'url(\'' + players[data.row.id].avatar + '\')' }"></span>
								<icon v-else icon="player" class="image" />
							</template>
							<template v-if="data.row.entityType === 'companion'">
								<span v-if="npcs[data.row.id].avatar" class="image" :style="{ backgroundImage: 'url(\'' + npcs[data.row.id].avatar + '\')' }"></span>
								<icon v-else icon="companion" class="image" />
							</template>
							<template v-else-if="data.row.entityType === 'npc'">
								<span v-if="data.row.avatar" class="image" :style="{ backgroundImage: 'url(\'' + data.row.avatar + '\')' }"></span>
								<span v-else-if="data.row.npc === 'custom' && npcs[data.row.id] && npcs[data.row.id].avatar" class="image" :style="{ backgroundImage: 'url(\'' + npcs[data.row.id].avatar + '\')' }"></span>
								<icon v-else-if="data.row.friendly" icon="monster" class="image" :style="data.row.color_label ? `border-color: ${data.row.color_label}` : ``" :fill="data.row.color_label" />
							</template>
						</template>

						<!-- NAME -->
						<span slot="name" slot-scope="data" class="green">
							{{ data.item }}
						</span>

						<!-- ACTIONS -->
						<div slot="actions" slot-scope="data" class="actions">
							<a v-if="data.row.entityType === 'npc'" 
								@click="setSlide({show: true, type: 'slides/editEncounter/EditEntity', data: data.row })" 
								class="mr-2 gray-hover" 
							>
								<i class="fas fa-pencil"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Edit
								</q-tooltip>
							</a>
							<a class="gray-hover" @click="remove(data.row.key, data.row.name)">
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
					<template slot="image" slot-scope="data">
						<span v-if="data.row.avatar" class="image" 
							:style="{
								backgroundImage: 'url(\'' + data.row.avatar + '\')',
								'border-color': data.row.color_label ? data.row.color_label : ``
							}" />
						<span 
							v-else-if="data.row.npc == 'custom' && npcs[data.row.id] && npcs[data.row.id].avatar" 
							class="image" 
							:style="{ 
								backgroundImage: 'url(\'' + npcs[data.row.id].avatar + '\')', 
								'border-color': data.row.color_label ? data.row.color_label : ``
							}" />
						<icon v-else icon="monster" class="image" :style="data.row.color_label ? `border-color: ${data.row.color_label}` : ``" :fill="data.row.color_label" />
					</template>

					<!-- NAME -->
					<span slot="name" slot-scope="data" class="red">
						{{ data.item }}
					</span>

					<div slot="actions" slot-scope="data" class="actions">
						<a @click="setSlide({show: true, type: 'slides/editEncounter/EditEntity', data: data.row })" class="mr-2 gray-hover">
						<q-tooltip anchor="top middle" self="center middle">
							Edit
						</q-tooltip>
							<i class="fas fa-pencil"></i>
						</a>
						<a class="gray-hover" @click="remove(data.row.key, data.row.name)">
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
	</div>
</div>
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

	export default {
		name: 'Overview',
		mixins: [difficulty],
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.getUser,
				slide: this.$store.getters.getSlide,
				showOverview: false,
				encDifficulty: undefined,
				bars: {
					trivial: 'secondary',
					easy: 'success',
					medium: 'warning',
					hard: 'info',
					deadly: 'danger',
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
						noPadding: true
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
					grid-area: overview;
					overflow-y: hidden;

					h3 {
						margin-bottom: 16px;
					}
					.diff-info {
						background: #302f2f;
						padding: 10px 10px 0 10px;

						span.left {
							width: 80px;
							display: inline-block;
						}

						.progress-area {
							.progress {
								background-color: #232323 !important;
							}
							.diff {
								display: none;
							}
						}
					}
					.scroll {
						height: calc(100% - 266px);

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
						background: #302f2f;
						overflow: scroll;
						width: 300px;
						transition: right .5s linear,
						box-shadow .5s linear;

						&.show {
							right: 0;
							box-shadow: 0 10px 15px #000;
						}

						h3.header {
							padding: 10px;
						}

						.scroll {
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
						color: #fff !important;

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