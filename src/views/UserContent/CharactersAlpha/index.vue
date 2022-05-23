<template>
	<div class="content">
		<h1>Your characters</h1>

		<template v-if="characters">
			<h2 class="mt-3 d-flex justify-content-between">
				<span>Characters</span>
				<a @click="addCharacter">
					<i class="fas fa-plus green" aria-hidden="true"/> New Character
				</a>
			</h2>
			
			<hk-table
				:columns="columns"
				:items="_characters"
				:search="['character_name', 'campaign_name']"
			>
				<template slot="avatar" slot-scope="data">
					<div class="image" v-if="data.row.general.avatar" :style="{ backgroundImage: 'url(\'' + data.row.general.avatar + '\')' }"></div>
					<img v-else class="image" src="src/assets/_img/styles/player.svg" alt="Player icon" />
				</template>

				<template slot="character_name" slot-scope="data">
					<router-link class="mx-2" :to="`${$route.path}/${data.row['.key']}`">
						{{ data.row.general.character_name }}
						<q-tooltip anchor="top middle" self="center middle">
							Edit
						</q-tooltip>
					</router-link>
				</template>

				<template slot="level" slot-scope="data">
					{{ data.row.general.level }}
				</template>

				<div slot="actions" slot-scope="data" class="actions">
					<router-link class="gray-hover mx-1" :to="`${$route.path}/${data.row['.key']}`">
						<i class="fas fa-pencil" aria-hidden="true"/>
						<q-tooltip anchor="top middle" self="center middle">
							Edit
						</q-tooltip>
					</router-link>
					<a class="gray-hover" @click="confirmDelete(data.row['.key'], data.row.general)">
							<i class="fas fa-trash-alt" aria-hidden="true"/>
							<q-tooltip anchor="top middle" self="center middle">
								Delete
							</q-tooltip>
					</a>
				</div>
			</hk-table>
		</template>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { db } from 'src/firebase';
	import { experience } from 'src/mixins/experience.js';

	export default {
		name: 'Characters',
		mixins: [experience],
		metaInfo: {
			title: 'Characters Alpha'
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				columns: {
					avatar: {
						width: 46,
						noPadding: true
					},
					character_name: {
						label: 'Character Name',
						truncate: true,
						sortable: true,
					},
					level: {
						label: 'Level',
						// center: true,
						// sortable: true,
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true,
						maxContent: true
					}
				}
			}
		},
		firebase() {
			return {
				characters: db.ref(`characters_base/${this.userId}`)
			}
		},
		computed: {
			_characters: function() {
				return _.chain(this.characters)
				.filter(function(character) {
					return character;
				})
				.orderBy("character_name", 'asc')
				.value()
			}
		},
		methods: {
			addCharacter() {
				const character_base = {
					general: {
						character_name: "Unnamed Character",
						advancement: "milestone",
						hit_point_type: "fixed"
					},
					class: {
						classes: {
							0: {
								level: 1
							}
						}
					}
				}

				//Add if not overencumbered
				if(!this.overencumbered) {
					db.ref(`characters_base/${this.userId}`).push(character_base).then(res => {
						//Returns the key of the added entry
						const key = res.getKey();

						this.$router.replace(`${this.$route.path}/${key}`)
					});
				}
			},
			confirmDelete(key, character) {
				this.$snotify.error('Are you sure you want to delete ' + character.character_name + '?', 'Delete character', {
					timeout: false,
					buttons: [
						{
							text: 'Yes', action: (toast) => { 
								this.deleteCharacter(key)
								this.$snotify.remove(toast.id); 
							}, 
							bold: false
						},
						{
							text: 'No', action: (toast) => { 
								this.$snotify.remove(toast.id); 
							}, 
							bold: false
						}
						]
				});
			},
			deleteCharacter(key) {
				//Remove character
				db.ref('characters_base/' + this.userId).child(key).remove(); 
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container-fluid {
		h2 {
			border-bottom: solid 1px $neutral-2;
			padding-bottom: 10px;

			a {
				text-transform: none;
				color: $neutral-2 !important;

				&:hover {
					text-decoration: none;
				}
			}
		}
	}

</style>