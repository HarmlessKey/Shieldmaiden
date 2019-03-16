<template>
	<div class="container">
		<h1>Manage your content</h1>

		<b-card-group deck v-if="tier">
			<!-- CAMPAIGNS -->
			<div class="card" v-if="campaigns">
				<div class="card-header">
					<i class="fas fa-dungeon"></i> Campaigns
				</div>

				<div class="card-body">
					<div class="p-2">
						( <span :class="{ 'green': true, 'red': Object.keys(campaigns).length > tier.benefits.campaigns }">{{ Object.keys(campaigns).length }}</span> 
						/ {{ tier.benefits.campaigns }} )
					</div>

					<b-list-group>
						<b-list-group-item v-for="(campaign, key) in campaigns" :key="key" class="d-flex justify-content-between">
							{{ campaign.campaign }}
							<span @click="confirmDelete(key, 'campaign', campaign.campaign)" class="pointer"><i class="fas fa-trash-alt red"></i></span>
						</b-list-group-item>
					</b-list-group>
				</div>
				<router-link class="btn" to="/campaigns">Show all</router-link>
			</div>

			<!-- ENCOUNTERS -->
			<div class="card encounters" v-if="allEncounters">
				<div class="card-header"><i class="fas fa-swords"></i> Encounters</div>

				<template v-for="(campaign, cKey) in campaigns">
						<div class="card-body">
							<div class="p-2">
								<span class="gray-hover">Campaign:</span> {{ campaign.campaign }}
								( <span :class="{ 'green': true, 'red': Object.keys(allEncounters[cKey]).length > tier.benefits.encounters }">{{ Object.keys(allEncounters[cKey]).length }}</span> 
								/ {{ tier.benefits.encounters }} )
							</div>
							<b-list-group :key="cKey">
								<b-list-group-item v-for="(encounter, key) in allEncounters[cKey]" :key="key" class="d-flex justify-content-between">
									{{ encounter.encounter }}
									<span @click="confirmDelete({ campKey: cKey, encKey: key }, 'encounter', encounter.encounter)" class="pointer"><i class="fas fa-trash-alt red"></i></span>
								</b-list-group-item>
							</b-list-group>
						</div>
					<router-link class="btn" :to="'/encounters/' + cKey">Show all</router-link>
				</template>
			</div>

			<!-- PLAYERS -->
			<div class="card" v-if="players">
				<div class="card-header">
					<i class="fas fa-users"></i> Players
				</div>

				<div class="card-body">
					<div class="p-2">
						( <span :class="{ 'green': true, 'red': Object.keys(players).length > tier.benefits.players }">{{ Object.keys(players).length }}</span> 
						/ {{ tier.benefits.players }} )
					</div>

					<b-list-group>
						<b-list-group-item v-for="(player, key) in players" :key="key" class="d-flex justify-content-between">
							{{ player.character_name }}
							<span @click="confirmDelete(key, 'player', player.character_name)" class="pointer"><i class="fas fa-trash-alt red"></i></span>
						</b-list-group-item>
					</b-list-group>
				</div>
				<router-link class="btn" to="/players">Show all</router-link>
			</div>

			<!-- NPCS -->
			<div class="card" v-if="npcs">
				<div class="card-header">
					<i class="fas fa-dragon"></i> NPC's
				</div>

				<div class="card-body">
					<div class="p-2">
						( <span :class="{ 'green': true, 'red': Object.keys(npcs).length > tier.benefits.npcs }">{{ Object.keys(npcs).length }}</span> 
						/ {{ tier.benefits.npcs }} )
					</div>

					<b-list-group>
						<b-list-group-item v-for="(npc, key) in npcs" :key="key" class="d-flex justify-content-between">
							{{ npc.name }}
							<span @click="confirmDelete(key, 'NPC', npc.name)" class="pointer"><i class="fas fa-trash-alt red"></i></span>
						</b-list-group-item>
					</b-list-group>
				</div>
				<router-link class="btn" to="/npcs">Show all</router-link>
			</div>
		</b-card-group>

	</div>
</template>

<script>
	import { db } from '@/firebase.js'
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'home',
		metaInfo: {
			title: 'Manage Content',
		},
		data() {
			return {
		
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'campaigns',
				'allEncounters',
				'players',
				'npcs',
			]),
			...mapGetters({
				user: 'getUser'
			}),
		},
		methods: {
			confirmDelete(key, type, name) {
				this.$snotify.error('Are you sure you want to delete the "' + type + '" "' + name + '"?', 'Delete "' + type + '"', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.delete(key, type); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			delete(key, type) {
				if(type == 'campaign') {
					this.deleteCampaign(key)
				} else if(type == 'encounter') {
					this.deleteEncounter(key)
				} else if(type == 'player') {
					this.deletePlayer(key)
				} else if(type == 'NPC') {
					this.deleteNPC(key)
				}
				this.$forceUpdate
			},
			deleteCampaign(key) {
				db.ref('campaigns/'+ this.user.uid).child(key).remove();
				db.ref('encounters/'+ this.user.uid).child(key).remove();
			},
			deletePlayer(key) {
				for(let campaign in this.campaigns) {
					//Remove player from campaigns
					db.ref('campaigns/' + this.user.uid + '/' + campaign + '/players').child(key).remove();

					//Go over all encounters of the campaign
					if (this.allEncounters && Object.keys(this.allEncounters).indexOf(campaign) > -1) {
						for(let enc in this.allEncounters[campaign]) {

							//Go over all entities in the encounter
							db.ref(`encounters/${this.user.uid}/${campaign}/${enc}/entities`).child(key).remove();
						}
					}
				}
				//Remove player
				db.ref('players/' + this.user.uid).child(key).remove(); 
			},
			deleteNPC(key) {
				//Remove the NPC from all encounters
				for(let campaign in this.campaigns) {
					if (this.allEncounters && Object.keys(this.allEncounters).indexOf(campaign) > -1) {
						//Go over all encounters of the campaign
						for(let enc in this.allEncounters[campaign]) {
							var entities = this.allEncounters[campaign][enc].entities;

							//Go over all entites in the encounter
							for(let entityKey in entities) {
								let npcId = entities[entityKey].id;
								
								//If the entity has the same id, delete it
								if(npcId == key) {
									db.ref(`encounters/${this.user.uid}/${campaign}/${enc}/entities/${entityKey}`).remove();
								}
							}
						}
					}
				}
				//Remove NPC
				db.ref('npcs/' + this.user.uid).child(key).remove(); 
			},
			deleteEncounter(key) {
				db.ref('encounters/' + this.user.uid + '/' + key.campKey).child(key.encKey).remove();
			},
		}
	}
</script>

<style lang="scss" scoped>
	.card {
		.card-body {
			padding: 0;
		}
		.list-group {
			border-top: solid 1px #191919 !important;

			.list-group-item {
				border-bottom: solid 1px #191919 !important;
			}
		}
		&.encounters {
			a.btn {
				margin-bottom: 20px;
				&:last-child {
					margin-bottom: 0;
				}
			}
		}	
	}
</style>