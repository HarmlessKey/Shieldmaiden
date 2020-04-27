<template>
	<div class="content">
		<h2 class="mb-1">Your Characters</h2>
		<p>The characters you play in other campaigns. Ask your DM to give you control over a character.</p>
		
		<hk-table
			v-if="controlledCharacters"
			:columns="columns"
			:items="controlledCharacters"
		>
			<template slot="avatar" slot-scope="data">
				<div class="image" v-if="data.row.character.avatar" :style="{ backgroundImage: 'url(\'' + data.row.character.avatar + '\')' }"></div>
				<img v-else class="image" src="@/assets/_img/styles/player.svg" />
			</template>

			<template slot="character_name" slot-scope="data">
				<router-link
					:to="'/characters/' + data.row.key" 
					v-b-tooltip.hover title="Edit">{{ data.row.character.character_name }}
				</router-link>
			</template>

			<template slot="level" slot-scope="data">
				{{ data.row.character.level ? data.row.character.level : calculatedLevel(data.row.character.experience) }}
			</template>

			<div slot="actions" slot-scope="data" class="actions">
				<router-link class="gray-hover mx-1" 
					:to="'/characters/' + data.row.key" 
					v-b-tooltip.hover title="Edit">
					<i class="fas fa-pencil"></i>
				</router-link>
			</div>
		</hk-table>
		<p v-else>You have no control over other characters.</p>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { experience } from '@/mixins/experience.js';

	export default {
		name: 'Characters',
		mixins: [experience],
		metaInfo: {
			title: 'Characters'
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				controlledCharacters: undefined,
				columns: {
					avatar: {
						width: 46,
						noPadding: true
					},
					character_name: {
						label: 'Character Name',
						truncate: true
					},
					level: {
						label: 'Level',
						center: true,
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
		async mounted() {
			//All controlled characters by this user
			var controlled = await db.ref(`character_control/${this.userId}`);
			controlled.on('value' , (snapshot) => {
				var returnArr = [];

				for(let key in snapshot.val()) {
					let item = snapshot.val()[key];
					item.key = key;

					var character = db.ref(`players/${item.user}/${key}`)

					character.on('value' , (snapshot) => {
						item.character = snapshot.val();

						returnArr.push(item); //push to array
					});
				}

				this.controlledCharacters = returnArr;
			});
		}
	}
</script>

<style lang="css" scoped>
	.container-fluid {
		padding: 20px;
	}
</style>