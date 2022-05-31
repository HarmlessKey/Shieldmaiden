<template>
	<hk-card>
		<ContentHeader type="characters" @add="addCharacter" />

		<div class="card-body">
			<template v-if="characters">	
				<q-table
					:data="characters"
					:columns="columns"
					row-key="key"
					card-class="bg-none"
					flat
					:dark="$store.getters.theme !== 'light'"
					:loading="loading_characters"
					separator="none"
					:pagination="{ rowsPerPage: 15 }"
					wrap-cells
				>	
					<template v-slot:body-cell="props">
						<q-td 
							v-if="props.col.name === 'avatar'" 
							class="avatar"
							:style="props.value ? `background-image: url('${props.value}')` : ''"
						>
							<i aria-hidden="true" v-if="!props.value" class="hki-player" />
						</q-td>
						<q-td v-else-if="props.col.name !== 'actions'">
							<div  class="truncate-cell">
								<div class="truncate">
									<router-link v-if="props.col.name === 'name'" :to="`${$route.path}/${props.key}`">
										{{ props.row.character_name }}
									</router-link>
									<template v-else>
										{{ props.row.character_name }}
									</template>
								</div>
							</div>
						</q-td>
						<q-td v-else class="text-right d-flex justify-content-between">
							<router-link class="btn btn-sm bg-neutral-5" :to="`${$route.path}/${props.key}`">
								<i aria-hidden="true" class="fas fa-pencil"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Edit
								</q-tooltip>
							</router-link>
							<a class="btn btn-sm bg-neutral-5 ml-2" @click="confirmDelete($event, props.key, props.row.general)">
								<i aria-hidden="true" class="fas fa-trash-alt"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Delete
								</q-tooltip>
							</a>
						</q-td>
					</template>
					<div slot="no-data" />
					<hk-loader slot="loading" name="characters" />
				</q-table>
			</template>
		</div>
	</hk-card>
</template>

<script>
	import { db } from 'src/firebase';
	import { experience } from 'src/mixins/experience.js';
	import { mapGetters, mapActions } from "vuex";
	import ContentHeader from "src/components/userContent/ContentHeader";

	export default {
		name: 'Characters',
		mixins: [experience],
		components: {
			ContentHeader
		},
		metaInfo: {
			title: 'Characters Alpha'
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				loading_characters: true,
				columns: [
					{
						name: "avatar",
						label: "",
						field: "avatar",
						align: "left"
					},
					{
						name: "name",
						label: "Name",
						field: "character_name",
						sortable: true,
						align: "left"
					},
					{
						name: "actions",
						label: "",
						align: "right"
					}
				]
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
			...mapGetters("characters", ["characters"])
		},
		async mounted() {
			await this.get_characters();
			this.loading_characters = false;
		},
		methods: {
			...mapActions("characters", ["get_characters", "add_character", "delete_character"]),
			async addCharacter() {
				await this.add_character().then(key => {
					this.$router.replace(`${this.$route.path}/${key}`);
				}).catch(error => {
					this.$snotify.error('Couldn\'t create character.', 'Save failed', {
						position: "rightTop"
					});
					console.error(error);
				});
			},
			confirmDelete(e, key, character) {
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