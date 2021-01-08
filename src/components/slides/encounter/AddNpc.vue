<template>
	<div class="pb-5">
		<h2>Add <span class="blue">{{ entity.name }}</span></h2>
		<q-form @submit="add()">
			<q-input 
				dark filled square
				autocomplete="off"
				label="Name"
				type="text" 
				name="name" 
				v-model="entity.name"
				:rules="[ val => val && val.length > 0 || 'Enter a name']"
			/>
			<hr>
			<div class="row q-col-gutter-md mb-2">
				<div class="col">
					<q-input 
						:key="`initiative-${entity.initiative}`"
						dark filled square
						autocomplete="off"
						label="Initiative"
						type="number" 
						name="initiative"
						min="0"
						v-model="entity.initiative"
						:rules="[ val => val && val.length > 0 || 'Required']"
					>
						<template v-slot:append>
							<a @click="rollInitiative">
							<q-icon size="small" name="fas fa-dice-d20"/>
							<q-tooltip anchor="top middle" self="center middle">
								1d20 {{ dexterity ? `+ ${calcMod(dexterity)}` : `` }}
							</q-tooltip>
						</a>
						</template>
					</q-input>
				</div>
				<div class="col">
					<q-input 
						dark filled square
						autocomplete="off"
						label="Armor class"
						type="number" 
						name="ac"
						min="1"
						v-model="entity.ac"
						:rules="[ val => val && val.length > 0 || 'Required']"
					/>
				</div>
				<div class="col">
					<q-input 
						dark filled square
						autocomplete="off"
						label="Hit points"
						type="number" 
						name="maxHp"
						min="1"
						v-model="entity.maxHp"
						:rules="[ val => val && val.length > 0 || 'Required']"
					/>
				</div>
			</div>
			<label class="my-2">When to add</label>
			<q-btn-toggle
				class="mt-2"
				v-model="addMoment"
				spread
				no-caps
				flat
				dark
				:options="options"
				toggle-color="primary"
			/>
			<hr>
			<q-btn class="btn btn-block mb-3" type="submit" label="Add" />
		</q-form>

		<h2>Copy an NPC from below</h2>
		
		<p>Search all NPC's, including your custom.</p>
		<q-input 
			dark filled square
			label="Search NPC"
			type="text" 
			autocomplete="off" 
			v-model="search"
			@keyup="searchNPC()" 
		>
			<q-icon slot="append" name="fas fa-search" size="xs" @click="searchNPC()" />
		</q-input>
		<ul class="entities">
			<p v-if="noResult" class="red">{{ noResult }}</p>
			<li v-for="(npc, index) in searchResults" :key="index" class="d-flex justify-content-between">
				<span :class="{ 'blue': npc.origin == 'custom' }">
					{{ npc.name }}
				</span>
				<a class="gray-hover" @click="set(npc['.key'], npc.origin)">
					<i class="fas fa-copy blue"></i>
					<span class="d-none d-md-inline ml-1">Copy</span>
					<q-tooltip anchor="top middle" self="center middle">
						Copy NPC
					</q-tooltip>
				</a>
			</li>
		</ul>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import { general } from '@/mixins/general.js';
	import { dice } from '@/mixins/dice.js';

	export default {
		name: 'AddEntity',
		mixins: [general, dice],
		data() {
			return {
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				entity: {},
				dexterity: undefined,
				search: '',
				searchResults: [],
				noResult: '',
				options: [
					{ label: 'Add next round', value: 'next' },
					{ label: 'Add directly', value: 'directly' },
				],
				addMoment: 'next'
			}
		},
		mounted() {
			//GET NPCS
			var monsters = db.ref(`monsters`);
			monsters.on('value', async (snapshot) => {
				let monsters = snapshot.val();

				for(let key in monsters) {
					monsters[key]['.key'] = key;
					monsters[key].origin = 'api';
				}
				let custom = db.ref(`npcs/${this.userId}`);
				custom.on('value', async (snapshot) => {
					let customNpcs = snapshot.val();
					for(let key in customNpcs) {
						customNpcs[key].origin = 'custom';
						customNpcs[key]['.key'] = key;
						monsters.push(customNpcs[key]);
					}
				});
				this.monsters = monsters;
				this.loadingNpcs = false;
			});
		},
		computed: {
			...mapGetters([
				'npcs',
			]),
		},
		methods: {
			...mapActions([
				'setSlide',
				'add_entity_demo',
				'add_entity',
			]),
			searchNPC() {
				this.searchResults = []
				this.searching = true
				for (var i in this.monsters) {
					var m = this.monsters[i]
					if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
						this.noResult = ''
						this.searchResults.push(m)
					}
				}
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
			},
			rollInitiative(e) {
				const mod = (this.dexterity) ? this.calcMod(this.dexterity) : 0;
				const roll = this.rollD(e, 20, 1, mod, `${this.entity.name ? this.entity.name : "Unnamed"}: Initiative`);
				this.$set(this.entity, "initiative", roll.total);
			},
			set(id, type) {
				this.entity.id = id;

				let npc_data;
				if(type === 'api') {
					npc_data = this.monsters[id];
					this.entity.npc = 'api'
					this.entity.maxHp = npc_data.hit_points
					this.entity.ac = npc_data.armor_class
					this.entity.name = npc_data.name
				}
				else if(type === 'custom') {
					npc_data = this.npcs;
					this.entity.npc = 'custom'
					this.entity.maxHp = npc_data[id].maxHp
					this.entity.ac = npc_data[id].ac
					this.entity.name = npc_data[id].name
				}
				this.dexterity = npc_data.dexterity;

				this.searchResults = [];
				this.searching = false;
				this.$forceUpdate();
			},
			add() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						this.entity.entityType = 'npc';
						this.entity.curHp = this.entity.maxHp;

						if(this.addMoment === 'next') {
							this.entity.addNextRound = true;
							this.entity.active = false;
						} else {
							this.entity.active = true;
						}
						this.entity.npc = (this.entity.npc) ? this.entity.npc : 'custom';
						
						if(!this.demo) {
							db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/entities').push(this.entity)
								.then(res => {
									//Returns the key of the added entry
									this.add_entity(res.getKey())
								});
						} else {
							this.add_entity_demo(this.entity);
						}
					} else {
						//console.log('Not valid');
					}
				})
			},
		}
	};
</script>

<style lang="scss" scoped>
	ul.entities {
		list-style: none;
		padding: 0;
		line-height: 25px;

		li {
			margin-bottom:5px;

			a {
				font-size:14px;
			}
		}
	}
	ul.nav {
		a.nav-link {
			&.active {
				background: #302f2f !important;
			}
		}
	}
	.tab-content {
		background: #302f2f !important;
		padding: 15px;
	}
</style>
