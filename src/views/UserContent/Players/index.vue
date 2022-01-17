<template>
	<hk-card v-if="tier">
		<ContentHeader type="players" />

		<div class="card-body">
			<p class="neutral-2">These are the players you can use in your campaigns.</p>
			<template v-if="players.length">
				<q-input 
					:dark="$store.getters.theme !== 'light'" 
					v-model="search"
					borderless 
					filled square
					debounce="300" 
					clearable
					placeholder="Search players"
				>
					<q-icon slot="prepend" name="search" />
				</q-input>

				<q-table
					:data="players"
					:columns="columns"
					row-key="key"
					card-class="bg-none"
					flat
					:dark="$store.getters.theme !== 'light'"
					:loading="loading_players"
					separator="none"
					:pagination="{ rowsPerPage: 15 }"
					:filter="search"
					wrap-cells
				>	
					<template v-slot:body-cell="props">
						<q-td 
							v-if="props.col.name === 'avatar'" 
							class="avatar"
							:style="props.value ? `background-image: url('${props.value}')` : ''"
						>
							<i v-if="!props.value" class="hki-player" />
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
								<i class="fas fa-pencil"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Edit
								</q-tooltip>
							</router-link>
							<a class="btn btn-sm bg-neutral-5 ml-2" @click="confirmDelete($event, props.key, props.row, props.rowIndex)">
								<i class="fas fa-trash-alt"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Delete
								</q-tooltip>
							</a>
						</q-td>
					</template>
					<div slot="no-data" />
					<hk-loader slot="loading" name="NPCs" />
				</q-table>
			</template>

			<template v-if="!tier || tier.name === 'Free'">
				<router-link class="btn bg-neutral-8 btn-block" to="/patreon">
					Get more player slots
				</router-link>
			</template>
			<router-link v-if="!players.length && !overencumbered" class="btn btn-block mt-4" to="/content/players/add-player">
				Create your first player
			</router-link>
		</div>
		<q-resize-observer @resize="setSize" />
	</hk-card>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { experience } from '@/mixins/experience.js';
	import ContentHeader from "@/components/userContent/ContentHeader";

	export default {
		name: 'Players',
		mixins: [experience],
		metaInfo: {
			title: 'Players'
		},
		components: {
			ContentHeader
		},
		data() {
			return {
				loading_players: true,
				search: "",
				card_width: 0,
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
			...mapGetters("players", ["players"])
		},
		async mounted() {
			await this.get_players();
			this.loading_players = false;
		},
		methods: {
			...mapActions("players", ["get_players", "delete_player"]),
			confirmDelete(e, key, player, index) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.deletePlayer(key, index);
				} else {
					this.$snotify.error('Are you sure you want to delete ' + player.character_name + '?', 'Delete player', {
						timeout: false,
						buttons: [
							{
								text: 'Yes', action: (toast) => { 
								this.deletePlayer(key, index)
								this.$snotify.remove(toast.id); 
								}, 
								bold: false
							},
							{
								text: 'No', action: (toast) => { 
									this.$snotify.remove(toast.id); 
								}, 
								bold: true
							},
						]
					});
				}
			},
			deletePlayer(key, index) {
				this.players.splice(index, 1);
				this.delete_player(key);
			},
			setSize(e) {
				this.card_width = e.width;
			},
		}
	}
</script>
