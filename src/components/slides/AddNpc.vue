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
			<b-col sm="2"><label>INT</label></b-col>
			<b-col>
				<b-form-input 
					type="number" 
					name="initiative"
					min="0"
					v-model="entity.initiative"
					:class="{'input': true, 'error': errors.has('initiative') }"
					v-validate="'required'"
					placeholder="Initiative"></b-form-input>
					<p class="validate red" v-if="errors.has('initiative')">{{ errors.first('initiative') }}</p>
			</b-col>
		</b-row>
		<hr>
		<b-row class="mb-2">
			<b-col sm="2"><label>AC</label></b-col>
			<b-col>
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
		</b-row>
		<b-row class="mb-2">
			<b-col sm="2"><label>HP</label></b-col>
			<b-col>
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
		<b-form-checkbox name="nextRound" checked="checked" v-model="entity.addNextRound">Add next round</b-form-checkbox>
		<hr>
		<button class="btn btn-block mb-3" @click="add()">Add</button>

		<h2>Copy an NPC from below</h2>
		<ul class="nav nav-tabs" id="myTab" role="tablist">
			<li class="nav-item">
				<a class="nav-link active" 
					id="search-tab" 
					data-toggle="tab" 
					href="#search" 
					role="tab" 
					aria-controls="search" 
					aria-selected="true">
					Search
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" 
					id="custom-tab" 
					data-toggle="tab" 
					href="#custom" 
					role="tab" 
					aria-controls="custom" 
					aria-selected="false">
					Custom
				</a>
			</li>
		</ul>

		<div class="tab-content">
			<div class="tab-pane fade show active" id="search" role="tabpanel" aria-labelledby="search-tab">
				<div class="input-group mb-3">
					<input type="text" v-model="search" @change="searchNPC()" placeholder="Search NPC" class="form-control"/>
					<div class="input-group-append">
						<button class="btn"><i class="fas fa-search"></i></button>
					</div>
				</div>
				<ul class="entities">
					<p v-if="noResult" class="red">{{ noResult }}</p>
					<li v-for="npc in searchResults" class="d-flex justify-content-between">
						{{ npc.name }}
						<a v-b-tooltip.hover title="Copy NPC" @click="set(npc.index, 'api')"><i class="fas fa-copy"></i></a>
					</li>
				</ul>
			</div>

			<div class="tab-pane fade" id="custom" role="tabpanel" aria-labelledby="custom-tab">
				<template v-if="npcs">
					<ul class="entities">
						<li v-for="(npc, key) in npcs" 
							:key="key" 
							class="d-flex justify-content-between">
							<div class="d-flex justify-content-left">
								<span v-if="npc.avatar" class="img" :style="{ backgroundImage: 'url(\'' + npc.avatar + '\')' }"></span>
								{{ npc.name }}
							</div>
							<a v-b-tooltip.hover title="Copy NPC" @click="set(key, 'custom')"><i class="fas fa-copy"></i></a>
						</li>
					</ul>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'
	import axios from 'axios'

	export default {
		name: 'AddEntity',
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				entity: {},
				search: '',
				searchResults: [],
				noResult: '',
				allnpcs: [],
			}
		},
		mounted() {
			axios.get("https://crossorigin.me/http://www.dnd5eapi.co/api/monsters/", {
				headers: {
					"Access-Control-Allow-Origin": "*",
					'Content-Type': 'application/json',
				}
			})
			.then(response => {this.allnpcs = response.data.results})
		},
		computed: {
			...mapGetters([
				'npcs',
			]),
		},
		methods: {
			...mapActions([
				'setSlide',
				'add_entity',
			]),
			async getNPC(id) {
				return await axios.get("https://crossorigin.me/http://www.dnd5eapi.co/api/monsters/" + id, {
					headers: {
						"Access-Control-Allow-Origin": "*",
						'Content-Type': 'application/json',
					}
				})
				.then(response => {return response.data})
			},
			searchNPC() {
				this.searchResults = []
				for (var i in this.allnpcs) {
					var m = this.allnpcs[i]
					if (m.name.toLowerCase().includes(this.search.toLowerCase())) {
						axios.get(m.url).then(response => {
							this.noResult = ''
							this.searchResults.push(response.data)
						})
					}
					if(this.searchResults == '') {
						this.noResult = 'No results for "' + this.search + '"';
					}
				}
			},
			async set(id, type) {
				this.entity.id = id;

				if(type == 'api') {
					var npc_data = await this.getNPC(id);
					this.entity.npc = 'api'
					this.entity.maxHp = npc_data.hit_points
					this.entity.ac = npc_data.armor_class
					this.entity.name = npc_data.name
				}
				else if(type == 'custom') {
					var npc_data = this.npcs;
					this.entity.npc = 'custom'
					this.entity.maxHp = npc_data[id].maxHp
					this.entity.ac = npc_data[id].ac
					this.entity.name = npc_data[id].name
				}
				this.$forceUpdate()
			},
			add() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						this.entity.entityType = 'npc';
						this.entity.curHp = this.entity.maxHp;
						this.entity.active = false;

						db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/entities').push(this.entity)
							.then(res => {
								//Returns the key of the added entry
								this.add_entity(res.getKey())
							}
							);
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
		list-style:none;
		padding:0;
		line-height:30px;

		li {
			margin-bottom:5px;

			a {
				font-size:14px;
			}
		}
		.img {
			width: 30px;
			height: 30px;
			display: block;
			background-size: cover;
			background-position: top center;
			border: solid 1px #b2b2b2;
			background-color: #000;
			margin-right: 10px;
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
