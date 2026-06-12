<template>
	<hk-card>
		<ContentHeader type="characters" @add="addCharacter" />

		<div class="card-body">
			<h3>Thank you <strong>{{ userInfo.username }}</strong> for helping us test our Character Builder!</h3>

			<h4>Disclaimer</h4>
			<p>
				This is an early phase of our Character Builder and it will definitely not be bug free.<br/>
				If you find a <strong>bug</strong>, please report it on our Discord in the designated channel 
				<a href="https://discord.com/channels/654675574488563714/982257934153166858" target="_blank" rel="noopener">#character-builder</a>.
			</p>
			<p>
				During our closed alpha phase we might at any time delete all characters of all users. We will send a notification on Discord whenever we do this.
			</p>

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
					<template v-slot:body="props">
						<q-tr :props="props">
							<q-td
								v-for="col in props.cols"
								:key="col.name"
								:props="props"
								:auto-width="col.name !== 'name'"
								:style="col.name === 'avatar' && col.value ? `background-image: url('${col.value}')` : ''"
							>
								<template v-if="col.name === 'avatar'">
									<i aria-hidden="true" v-if="!col.value" class="hki-player" />
								</template>
								<template v-else-if="col.name !== 'actions'">
									<router-link v-if="col.name === 'name'" :to="`${$route.path}/${props.key}`">
										{{ col.value }}
									</router-link>
									<template v-else>
										{{ col.value }}
									</template>
								</template>
								<div v-else class="text-right d-flex justify-content-end">
									<router-link class="btn btn-sm bg-neutral-5" :to="`${$route.path}/${props.key}`">
										<i aria-hidden="true" class="fas fa-pencil"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Edit
										</q-tooltip>
									</router-link>
									<a class="btn btn-sm bg-neutral-5 ml-2" @click="confirmDelete($event, props.key, props.row)">
										<i aria-hidden="true" class="fas fa-trash-alt"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Delete
										</q-tooltip>
									</a>
								</div>
							</q-td>
						</q-tr>
					</template>
					<div slot="no-data" />
					<hk-loader slot="loading" name="characters" />
				</q-table>
			</template>
		</div>
	</hk-card>
</template>

<script>
	import { experience } from 'src/mixins/experience.js';
	import { mapGetters, mapActions } from "vuex";
	import ContentHeader from "src/components/userContent/ContentHeader";

	export default {
		name: 'CharacterBuilder',
		mixins: [experience],
		components: {
			ContentHeader
		},
		preFetch({ store, redirect }) {
			if(store.getters.userInfo && store.getters.userInfo.admin) {
				return;
			}
      if(!store.getters.userInfo || !store.getters.userInfo.contribute || !store.getters.userInfo.contribute.includes("character-builder")) {
				redirect('/');
			} 
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
						align: "left",
						classes: "avatar"
					},
					{
						name: "name",
						label: "Name",
						field: "character_name",
						classes: "truncate-cell",
						sortable: true,
						align: "left"
					},
					{
						name: "level",
						label: "Level",
						field: "level",
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
				"userInfo"
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
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.deletePlayer(key);
				} else {
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
				}
			},
			deleteCharacter(key) {
				this.delete_character(key);
			}
		}
	}
</script>