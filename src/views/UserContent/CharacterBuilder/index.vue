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
										{{ props.value }}
									</router-link>
									<template v-else>
										{{ props.value }}
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
							<a class="btn btn-sm bg-neutral-5 ml-2" @click="confirmDelete($event, props.key, props.row)">
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