<template>
	<div class="pb-5">
		<h2>Add <span class="blue">{{ entity.name }}</span></h2>
		<b-form-input 
			type="text" 
			name="name" 
			v-model="entity.name"
			:class="{'input': true, 'error': errors.has('name') }"
			v-validate="'required'"
			placeholder="Name"></b-form-input>
			<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
		<hr>
		<b-row class="mb-2">
			<b-col class="text-center">
				<label>Init.</label>
				<b-form-input 
					type="number" 
					name="initiative"
					min="0"
					v-model="entity.initiative"
					:class="{'input': true, 'error': errors.has('initiative') }"
					v-validate="'required'"
					placeholder="Initiative"
					></b-form-input>
					<p class="validate red" v-if="errors.has('initiative')">{{ errors.first('initiative') }}</p>
			</b-col>
			<b-col class="text-center">
				<label>AC</label>
				<b-form-input 
					type="number" 
					name="ac"
					min="1"
					v-model="entity.ac"
					:class="{'input': true, 'error': errors.has('ac') }"
					v-validate="'required'"
					placeholder="Armor Class"></b-form-input>
					<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
			</b-col>
			<b-col class="text-center">
				<label >Hit Points</label>
				<b-form-input 
					type="number" 
					name="maxHp"
					min="1"
					:class="{'input': true, 'error': errors.has('maxHp') }"
					v-validate="'required'"
					v-model="entity.maxHp"
					placeholder="Hit Points"></b-form-input>
					<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
			</b-col>
		</b-row>
		<label >When to add</label>
		<b-form-group>
			<b-form-radio-group
				id="btn-radios-1"
				v-model="addMoment"
				:options="options"
				buttons
				name="radios-btn-default"
			></b-form-radio-group>
		</b-form-group>
		<hr>
		<button class="btn btn-block mb-3" @click="add()">Add</button>

		<h2>Copy an NPC from below</h2>
		
		<p>Search all NPC's, including your custom.</p>
		<div class="input-group mb-3">
			<input type="text" v-model="search" @keyup="searchNPC()" placeholder="Search NPC" class="form-control" />
			<div class="input-group-append">
				<button class="btn"><i class="fas fa-search"></i></button>
			</div>
		</div>
		<ul class="entities">
			<p v-if="noResult" class="red">{{ noResult }}</p>
			<li v-for="(npc, index) in searchResults" :key="index" class="d-flex justify-content-between">
				<span :class="{ 'blue': npc.origin == 'custom' }">
					{{ npc.name }}
				</span>
				<a class="gray-hover" v-b-tooltip.hover title="Copy NPC" @click="set(npc['.key'], npc.origin)">
					<i class="fas fa-copy blue"></i>
					<span class="d-none d-md-inline ml-1">Copy</span>
				</a>
			</li>
		</ul>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';

	export default {
		name: 'AddEntity',
		data() {
			return {
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				entity: {},
				search: '',
				searchResults: [],
				noResult: '',
				options: [
					{ text: 'Add next round', value: 'next' },
					{ text: 'Add directly', value: 'directly' },
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
			set(id, type) {
				this.entity.id = id;

				if(type == 'api') {
					var npc_data = this.monsters[id];
					this.entity.npc = 'api'
					this.entity.maxHp = npc_data.hit_points
					this.entity.ac = npc_data.armor_class
					this.entity.name = npc_data.name
				}
				else if(type == 'custom') {
					npc_data = this.npcs;
					this.entity.npc = 'custom'
					this.entity.maxHp = npc_data[id].maxHp
					this.entity.ac = npc_data[id].ac
					this.entity.name = npc_data[id].name
				}
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
