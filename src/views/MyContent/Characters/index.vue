<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="players" class="container-fluid">
				<h2 class="mb-1">Your Characters</h2>
			<p>The characters you play in other campaigns. Ask your DM to give you control over a character.</p>
			
			<table class="table" v-if="controlledCharacters">
				<thead>
					<th></th>
					<th class="n">#</th>
					<th>Character name</th>
					<th>Level</th>
					<th class="text-right"><i class="far fa-ellipsis-h"></i></th>
				</thead>
				<tbody name="table-row">
					<tr v-for="(character, index) in controlledCharacters" :key="character.key">
						<td class="img" v-if="character.character.avatar" :style="{ backgroundImage: 'url(\'' + character.character.avatar + '\')' }"></td>
						<td class="img" v-else>
							<img src="@/assets/_img/styles/player.svg" />
						</td>
						<td class="n">{{ index + 1 }}</td>
						<td>
							<router-link class="mx-2" 
								:to="'/characters/' + character.key" 
								v-b-tooltip.hover title="Edit">{{ character.character.character_name }}
							</router-link>
						</td>
						<td>{{ character.character.level }}</td>
						<!-- Actions -->
						<td class="align-middle p-0">
							<div class="d-flex justify-content-end">
								<div class="d-flex justify-content-end actions">
									<router-link class="gray-hover mx-1" 
										:to="'/characters/' + character.key" 
										v-b-tooltip.hover title="Edit">
										<i class="fas fa-pencil"></i>
									</router-link>
								</div>
								<i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			<p v-else>You have no control over other characters.</p>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import { db } from '@/firebase'

	export default {
		name: 'Players',
		metaInfo: {
			title: 'Players'
		},
		components: {
			Sidebar
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				controlledCharacters: undefined
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