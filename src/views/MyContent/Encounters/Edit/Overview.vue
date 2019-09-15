<template>
   <div class="encounter_overview">
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
           <div class="overview">
                
                
                <template v-if="encounter">
                    <h3>{{ Object.keys(_friendlies).length }} Players and friendlies</h3>
                    <ul class="entities hasImg mt-2">
                        <li v-for="entity in _friendlies" :key="entity.key" class="d-flex justify-content-between">
                            <div class="d-flex justify-content-left">
                                <template v-if="entity.entityType == 'player'">
                                    <span v-if="players[entity.id].avatar" class="img" :style="{ backgroundImage: 'url(\'' + players[entity.id].avatar + '\')' }"></span>
                                    <img v-else src="@/assets/_img/styles/player.png" class="img" />
                                </template>
                                <template v-else-if="entity.entityType == 'npc'">
                                    <span v-if="entity.avatar" class="img" :style="{ backgroundImage: 'url(\'' + entity.avatar + '\')' }"></span>
                                    <span v-else-if="entity.npc == 'custom' && npcs[entity.id] && npcs[entity.id].avatar" class="img" :style="{ backgroundImage: 'url(\'' + npcs[entity.id].avatar + '\')' }"></span>
                                    <img v-else-if="entity.friendly" src="@/assets/_img/styles/player.png" class="img" />
                                </template>
                                <span class="green">
                                    {{ entity.name }}
                                </span>
                            </div>
                            <div class="actions">
                                <a v-if="entity.entityType == 'npc'" @click="setSlide({show: true, type: 'slides/Edit', data: entity })" class="mr-2 gray-hover" v-b-tooltip.hover title="Edit">
                                    <i class="fas fa-pencil"></i>
                                </a>
                                <a class="gray-hover" v-b-tooltip.hover title="Remove Character" @click="remove(entity.key, entity.name)">
                                    <i class="fas fa-minus"></i>
                                </a>
                            </div>
                            <i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
                        </li>
                    </ul>

                    <h3>{{ Object.keys(_monsters).length }} Monsters</h3>
                    <ul class="entities hasImg mt-2">
                        <li v-for="entity in _monsters" :key="entity.key" class="d-flex justify-content-between">
                            <div class="d-flex justify-content-left">
                                <span v-if="entity.avatar" class="img" :style="{ backgroundImage: 'url(\'' + entity.avatar + '\')' }"></span>
                                <span v-else-if="entity.npc == 'custom' && npcs[entity.id] && npcs[entity.id].avatar" class="img" :style="{ backgroundImage: 'url(\'' + npcs[entity.id].avatar + '\')' }"></span>
                                <img v-else src="@/assets/_img/styles/monster.png" class="img" />
                                <span class="red">
                                    {{ entity.name }}
                                </span>
                            </div>
                            <div class="actions">
                                <a @click="setSlide({show: true, type: 'slides/Edit', data: entity })" class="mr-2 gray-hover" v-b-tooltip.hover title="Edit">
                                    <i class="fas fa-pencil"></i>
                                </a>
                                <a class="gray-hover" v-b-tooltip.hover title="Remove Character" @click="remove(entity.key, entity.name)">
                                    <i class="fas fa-minus"></i>
                                </a>
                            </div>
                            <i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
                        </li>
                    </ul>
                </template>
                <div v-else class="loader"><span>Loading entities...</span></div>
           </div>
       </div>
    </div>
</template>

<script>
    import { db } from '@/firebase';
    import { mapActions, mapGetters } from 'vuex';
    import { difficulty } from '@/mixins/difficulty.js'

	export default {
        name: 'Overview',
        mixins: [difficulty],
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.getUser,
                slide: this.$store.getters.getSlide,
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
						return entity.friendly || entity.entityType === 'player';
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
				this.encDifficulty = await this.difficulty(this.encounter.entities)
			},
        }
	}
</script>

<style lang="scss" scoped>
.encounter_overview {
    grid-area: overview;
    overflow: hidden;

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
        height: calc(100% - 250px);
        
        .overview {
            padding: 15px 10px 30px 10px;
            width: calc(100% - 5px) !important;
        }
	}
}
@media only screen and (max-width: 767px) {
		h3.header {
            display:none;
        } 
        .scroll {
            height: calc(100% - 50px) !important;
        } 
        .diff-info {
            padding-top: 15px !important;

            .advanced {
                display: none;
            }
            .progress-area {
                display: flex;
                justify-content: space-between;

                .progress {
                    width: 100%;
                    margin: 0 10px 0 0 !important;
                    height: 25px;
                }
                .diff {
                    text-transform: uppercase;
                    display: block !important;
                    width: max-content;
                    line-height: 25px;
                    font-size: 25px;
                }
            }
        }      
	}
</style>