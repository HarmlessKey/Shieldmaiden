<template>
	<div v-if="overencumbered" class='container'>
		<OverEncumbered/>
	</div>
	<div class="content" v-else-if="npc || $route.name == 'AddNPC'">
		<div class="form">
			<a class="tab" :class="{ active: !quick }" @click="setQuick(0)">Complete Build</a>
			<a class="tab" :class="{ active: quick }" @click="setQuick(1)">Quick Build</a>

			<hk-card header="Copy Existing NPC" v-if="$route.name == 'AddNPC'">
				
				<div class="input-group mb-3">
					<input type="text" autocomplete="off" v-model="search" @keyup="searchNPC()" placeholder="Search NPC" class="form-control"/>
					<div class="input-group-append">
						<button class="btn" @click="searchNPC()"><i class="fas fa-search"></i></button>
					</div>
				</div>
				<ul class="entities">
					<p v-if="noResult" class="red">{{ noResult }}</p>
					<li v-for="(npc, index) in searchResults" :key="index" class="d-flex justify-content-between">
						<div class="d-flex justify-content-left">
							<a @click="setSlide({show: true, type: 'ViewEntity', data: npc})" class="mr-2" v-b-tooltip.hover title="Show Info">
								<i class="fas fa-info-circle"></i></a>
							{{ npc.name }}
						</div>
						<a class="gray-hover" 
							v-b-tooltip.hover title="Copy NPC" 
							@click="copy(npc)">
							<i class="fas fa-copy blue"></i>
							<span class="d-none d-md-inline ml-1">Copy</span>
						</a>
					</li>
				</ul>
			</hk-card>
			
			<hk-card header="Basic Info">
				<b-row>
					<b-col md="9" class="mb-3">
						<!-- NAME -->
						<b-row>
							<b-col sm="2"><label for="name">Name *</label></b-col>
							<b-col>
								<b-form-input autocomplete="off"  
									v-b-tooltip.hover title="Name"
									type="text" 
									class="form-control mb-2" 
									:class="{'input': true, 'error': errors.has('name') }" 
									v-model="npc.name" 
									v-validate="'max:35|required'" 
									maxlength="35"
									data-vv-as="Name"
									id="name"
									name="name" 
									placeholder="Name*"></b-form-input>
								<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
							</b-col>
						</b-row>

						<!-- SIZE -->
						<b-row v-if="quick == false">
							<b-col sm="2"><label for="size">Size</label></b-col>
								<b-col>
									<b-form-input autocomplete="off" 
										v-b-tooltip.hover title="Size"
										type="text" 
										class="form-control mb-2" 
										v-model="npc.size"
										maxlenght="30"
										id="size"
										name="size" 
										placeholder="Size"></b-form-input>
								</b-col>
						</b-row>
						
						<!-- TYPE -->
						<b-row v-if="quick == false">
							<b-col sm="6">
								<b-row>
									<b-col sm="4"><label for="type">Type</label></b-col>
									<b-col sm="8">
										<b-form-input autocomplete="off" 
											v-b-tooltip.hover title="Type"
											type="text" 
											class="form-control mb-2" 
											v-model="npc.type" 
											name="type" 
											id="type"
											placeholder="Type"></b-form-input>
									</b-col>
								</b-row>
							</b-col>

							<b-col sm="6">
								<b-row>
									<b-col sm="4"><label for="subtype">Subtype</label></b-col>
									<b-col sm="8">
										<b-form-input autocomplete="off" 
											v-b-tooltip.hover title="Subtype"
											type="text"
											class="form-control mb-2"
											v-model="npc.subtype" 
											name="subtype" 
											id="subtype"
											placeholder="Subtype"></b-form-input>
									</b-col>
								</b-row>
							</b-col>
						</b-row>

						<!-- ALIGNMENT -->
						<b-row v-if="quick == false">
							<b-col sm="2"><label for="alignment">Alignment</label></b-col>
							<b-col>
								<b-form-input autocomplete="off"  v-b-tooltip.hover title="Alignment"
									type="text" 
									class="form-control mb-2" 
									v-model="npc.alignment" 
									name="alignment" 
									id="alignment"
									placeholder="Alignment"></b-form-input>
							</b-col>
						</b-row>

						<!-- SPEED -->
						<b-row>
							<b-col sm="2"><label for="speed">Speed</label></b-col>
							<b-col>
								<b-form-input autocomplete="off"  
									v-b-tooltip.hover title="Speed"
									type="text" 
									class="form-control mb-2" 
									v-model="npc.speed" 
									name="speed" 
									id="speed"
									placeholder="Speed"></b-form-input>
							</b-col>
						</b-row>

						<!-- SENSES -->
						<b-row v-if="quick == false">
							<b-col sm="2"><label for="senses">Senses</label></b-col>
							<b-col>
								<b-form-input autocomplete="off"  v-b-tooltip.hover title="Senses" 
									type="text" 
									class="form-control mb-2" 
									v-model="npc.senses" 
									name="senses" 
									id="senses"
									placeholder="Senses"></b-form-input>
							</b-col>
						</b-row>

						<!-- LANGUAGES -->
						<b-row v-if="quick == false">
							<b-col sm="2"><label for="languages">Languages</label></b-col>
							<b-col>
								<b-form-input autocomplete="off"  v-b-tooltip.hover title="Languages" 
									type="text" 
									class="form-control mb-2" 
									v-model="npc.languages" 
									name="Languages" 
									id="languages"
									placeholder="Languages"></b-form-input>
							</b-col>
						</b-row>

						<!-- CR -->
						<b-row>
							<b-col sm="2"><label for="cr">Challenge rating</label></b-col>
							<b-col>
									<b-form-select v-model="npc.challenge_rating" class="mb-2" id="cr">
										<option value="undefined" disabled selected>- Select CR -</option>
										<option value="0">0</option>
										<option value="0.125">1/8</option>
										<option value="0.25">1/4</option>
										<option value="0.5">1/2</option>
										<option v-for="index in 24" :value="index" :key="index">{{ index }}</option>
										<option value="30">30</option>
									</b-form-select>
							</b-col>
						</b-row>

						<!-- AVATAR -->
						<b-row>
							<b-col sm="2"><label for="avatar">Avatar</label></b-col>
							<b-col>
								<b-form-input autocomplete="off"  
									v-b-tooltip.hover title="Avatar"
									type="text" 
									class="form-control mb-2" 
									:class="{'input': true, 'error': errors.has('avatar') }" 
									v-model="npc.avatar" 
									v-validate="'url'" 
									data-vv-as="Avatar"
									name="avatar" 
									id="avatar"
									placeholder="Image URL"></b-form-input>
								<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>
							</b-col>
						</b-row>

						<!-- FRIENDLY NPC -->
						<b-row>
							<b-col sm="2"><label for >Friendly NPC</label></b-col>
							<b-col>
								<b-form-checkbox v-model="npc.friendly" class="mt-1 mb-2" id="friendly"><em>Add as friendly</em></b-form-checkbox>
							</b-col>
						</b-row>
					</b-col>

					<b-col md="3" v-if="npc.avatar">
						<div class="img-container"><img :src="npc.avatar" /></div>
					</b-col>
				</b-row>
			</hk-card>

			<hk-card header="Health & Armor Class">
				<b-row>
					<b-col class="col">
						<label for="ac">Armor Class *</label>
						<b-form-input autocomplete="off"  
							v-b-tooltip.hover title="Armor Class"
							type="number" 
							class="form-control" 
							:class="{'input': true, 'error': errors.has('ac') }" 
							v-model="npc.ac" 
							v-validate="'required'" 
							name="ac" 
							id="ac"
							data-vv-as="Armor Class"
							placeholder="Armor Class"></b-form-input>
						<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
					</b-col>
					<b-col class="col">
						<label for="hp">Hit Points *</label>
						<b-form-input autocomplete="off"  
							v-b-tooltip.hover title="Hit Points"
							type="number" 
							class="form-control" 
							:class="{'input': true, 'error': errors.has('Hit Points') }" 
							v-model="npc.maxHp" 
							v-validate="'required'" 
							name="hp" 
							id="hp"
							data-vv-as="Hit Points"
							placeholder="Hit Points"></b-form-input>
						<p class="validate red" v-if="errors.has('hp')">{{ errors.first('hp') }}</p>
					</b-col>
					<b-col class="col" v-if="quick == false">
						<label for="hitdice">
							Hit Dice {{ npc.hit_dice ? `(${hitDiceStr(npc)})` : '' }}
							<a v-b-popover.hover.top="'The modifier is the NPC\'s Constitution modifier.'" title="Hit Dice + Modifier"><i class="fas fa-info-circle"></i></a>
						</label>
						<b-form-input autocomplete="off" 
							v-b-tooltip.hover title="Hit Dice"
							type="text" 
							class="form-control" 
							v-model="npc.hit_dice"  
							v-validate="{ regex:/^[0-9]+d[0-9]+$/ }"
							name="hit_dice" 
							id="hitdice"
							data-vv-as="Hit Dice"
							placeholder="Hit Dice"></b-form-input>
							<p class="validate red" 
								v-if="errors.has('hit_dice')">
								{{ errors.first('hit_dice') }}
								Allowed format: "2d6".
							</p>
					</b-col>
				</b-row>
			</hk-card>

			<b-row>
				<b-col sm="6">
					<hk-card header="Ability Scores">
						<b-row class="mb-2" v-for="(ability, index) in abilities" :key="index">
							<b-col class="col-3">
								<label :for="ability.ability">
									<!-- <svg class="icon" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512">
										<path :d="ability.icon"></path>
									</svg> -->
									{{ ability.ability.substring(0,3).toUpperCase() }}
								</label>
							</b-col>
							<b-col class="col-9">
								<b-form-input autocomplete="off"  
									:id="ability.ability" 
									type="number" 
									v-model="npc[ability.ability]" 
									:name="ability.ability" 
									:placeholder="ability.ability.substring(0,3).toUpperCase()"></b-form-input>
							</b-col>
						</b-row>
					</hk-card>
				</b-col>
				<b-col sm="6">
					<hk-card header="Saving Throws" v-if="quick == false">
						<b-row class="mb-2" v-for="(ability, index) in abilities" :key="index">
							<b-col class="col-3">
								<label :for="ability.ability+'_save'">{{ ability.ability.substring(0,3).toUpperCase() }}</label>
							</b-col>
							<b-col class="col-9">
								<b-form-input autocomplete="off"  
									:id="ability.ability+'_save'" 
									type="number" 
									v-model="npc[ability.ability+'_save']" 
									:name="ability.ability" 
									:placeholder="ability.ability.substring(0,3).toUpperCase()"></b-form-input>
							</b-col>
						</b-row>
					</hk-card>
				</b-col>
			</b-row>

			<div class="card" v-if="quick == false">
				<div class="card-header">Skills</div>
					<div class="card-body">
						<b-row>
							<b-col md="6">
								<b-row class="skills" v-for="(skill, index) in skills.slice(0,9)" :key="index">
										<b-col class="col-5">
											<label class="text-capitalize" :for="skill">{{ skill }}</label>
										</b-col>
										<b-col class="col-7">
											<input 
												autocomplete="off"
												type="number" 
												class="form-control mr-2 text-capitalize" 
												v-model="npc[skill]" 
												name="skill" 
												:id="skill"
												:placeholder="skill" />
										</b-col>
								</b-row>
							</b-col>
							<b-col md="6">
								<b-row class="skills" v-for="(skill, index) in skills.slice(9,18)" :key="index">
										<b-col class="col-5">
											<label class="text-capitalize" :for="skill">{{ skill }}</label>
										</b-col>
										<b-col class="col-7">
											<input 
												autocomplete="off"
												type="number" 
												class="form-control mr-2 text-capitalize" 
												v-model="npc[skill]" 
												name="skill" 
												:id="skill"
												:placeholder="skill" />
										</b-col>
								</b-row>
							</b-col>
						</b-row>
					</div>
			</div>
			
			<template v-if="quick == false">
				<hk-card header="Resistances & Vulnerabilities">
					<b-row>
						<b-col md="4"><label for="dmg_vul">Damage Vulnerabilities</label></b-col>
						<b-col>
							<b-form-input autocomplete="off"  type="text"
								v-b-tooltip.hover title="Damage Vulnerabilities" 
								class="form-control mb-2" 
								v-model="npc.damage_vulnerabilities" 
								name="damage_vulnerabilities" 
								id="dmg_vul"
								placeholder="Damage Vulnerabilities"></b-form-input>
						</b-col>
					</b-row>
					
					<b-row>
						<b-col md="4"><label for="dmg_res">Damage Resistances</label></b-col>
						<b-col>
							<b-form-input autocomplete="off"  
								v-b-tooltip.hover title="Damage Resistances" 
								type="text" 
								class="form-control mb-2" 
								v-model="npc.damage_resistances" 
								name="damage_resistances" 
								id="dmg_res"
								placeholder="Damage Resistances"></b-form-input>
						</b-col>
					</b-row>

					<b-row>
						<b-col md="4"><label for="dmg_im">Damage Immunities</label></b-col>
						<b-col>
							<b-form-input autocomplete="off"  
								v-b-tooltip.hover title="Damage Immunities" 
								type="text" 
								class="form-control mb-2" 
								v-model="npc.damage_immunities" 
								name="damage_immunities"
								id="dmg_im" 
								placeholder="Damage Immunities"></b-form-input>
						</b-col>
					</b-row>

					<b-row>
						<b-col md="4"><label for="con_im">Condition Immunities</label></b-col>
						<b-col>	
							<b-form-input autocomplete="off"  
								v-b-tooltip.hover title="Condition Immnunities" 
								type="text" 
								class="form-control mb-2" 
								v-model="npc.condition_immunities" 
								name="condition_immunities" 
								id="con_im"
								placeholder="Condition Immunities"></b-form-input>
						</b-col>
					</b-row>
				</hk-card>
			</template>

			<!-- ACTIONS / ABILITIES -->
			<template v-if="quick == false">
				<div class="card" v-for="(action, index) in actions" :key="index">
					<div class="card-header d-flex justify-content-between">
						{{ action.name }}
						<a 
						class="gray-hover text-capitalize" 
						v-b-tooltip.hover title="Add Skill" 
						@click="add(action.type)">
							<i class="fas fa-plus green"></i>
							<span class="d-none d-md-inline ml-1">Add</span>
						</a>
					</div>
					<div class="card-body">
						<div v-for="(ability, index) in npc[action.type]" :key="index">
							<h2 class="d-flex justify-content-between">
								{{ index + 1 }}. {{ ability.name }}
								<a @click="remove(index, action.type)" 
									class="gray-hover text-capitalize"
									v-b-tooltip.hover title="Remove">
									<i class="fas fa-minus red"></i>
									<span class="d-none d-md-inline ml-1">Remove</span>
								</a>
							</h2>
							<b-row class="mb-2">
								<b-col sm="2">
									<label for="name">Name</label>
								</b-col>
								<b-col sm="10">
									<b-form-input autocomplete="off" 
										id="name"
										type="text" 
										class="form-control" 
										maxlength="30"
										v-model="ability.name" 
										name="name" 
										placeholder="Name"></b-form-input>
								</b-col>
							</b-row>
							<b-row>
								<b-col sm="2" class="mb-2">
									<label for="damage_dice">Damage Dice</label>
								</b-col>
								<b-col sm="10">
									<b-form-input autocomplete="off" 
										id="damage_dice"
										type="text" 
										class="form-control" 
										v-model="ability.damage_dice" 
										:name="'damage_dice_'+action.type+index"
										data-vv-as="Damage Dice"
										placeholder="Damage Dice"
										v-validate="{ regex:/^[0-9]+d[0-9]+(\+[0-9]+d[0-9]+)*$/ }"></b-form-input>
										<p class="validate red" 
											v-if="errors.has('damage_dice_'+action.type+index.toString())">
											{{ errors.first('damage_dice_'+action.type+index.toString()) }}
											Allowed format: "2d6" or "2d6+1d8".
										</p>
								</b-col>
								<b-col sm="2" class="mb-2">
									<label for="damage_bonus">Damage Bonus</label>
								</b-col>
								<b-col sm="10">
									<b-form-input autocomplete="off" 
										id="damage_bonus"
										type="number" 
										class="form-control" 
										v-model="ability.damage_bonus" 
										name="damage_bonus" 
										placeholder="Damage Bonus"></b-form-input>
								</b-col>
							</b-row>
							<b-row class="mb-2">
								<b-col sm="2">
									<label for="attack_bonus">Attack Bonus</label>
								</b-col>
								<b-col sm="10">
									<b-form-input autocomplete="off" 
										id="attack_bonus"
										type="number" 
										class="form-control" 
										v-model="ability.attack_bonus" 
										name="attack_bonus" 
										placeholder="Attack Bonus"></b-form-input>
								</b-col>
							</b-row>
							<b-row class="mb-2">
								<b-col sm="2">
									<label for="desc">Description</label>
								</b-col>
								<b-col sm="10">
									<textarea
										id="desc"
										class="form-control" 
										v-model="ability.desc" 
										rows="4"
										name="desc" 
										placeholder="Description"></textarea>
								</b-col>
							</b-row>
							<hr>
						</div>
					</div>
				</div>
			</template>
		</div>

		<div class="save">
			<p class="error red" v-if="errors.items && errors.items.length > 0">There is an error in your form.</p>
			<router-link to="/npcs" class="btn bg-gray mr-2">Cancel</router-link>
			<button v-if="$route.name == 'AddNPC'" class="btn" @click="addNpc()"><i class="fas fa-plus"></i> Add NPC</button>
			<button 
				v-else 
				:disabled="errors.items && errors.items.length > 0"
				class="btn" 
				@click="editNpc()"
			>
				<i class="fas fa-check"></i> Save
			</button>
		</div>
	</div>
</template>

<script>
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import { general } from '@/mixins/general.js';


	export default {
		name: 'Npcs',
		mixins: [general],
		metaInfo: {
			title: 'NPC\'s'
		},
		components: {
			OverEncumbered,
		},
		data() {
			return {
				userId: this.$route.params.userid || this.$store.getters.getUser.uid,
				npcId: this.$route.params.id,
				quick: false,
				search: '',
				searchResults: [],
				noResult: '',
				npcSkills: [],
				skills: [
					'acrobatics',
					'animal Handling',
					'arcana',
					'athletics',
					'deception',
					'history',
					'insight',
					'intimidation',
					'investigation',
					'medicine',
					'nature',
					'perception',
					'performance',
					'persuasion',
					'religion',
					'sleight of Hand',
					'stealth',
					'survival',
				],
				actions: [
					{ type: 'special_abilities', name: 'Special Abilities' },
					{ type: 'actions', name: 'Actions' },
					{ type: 'legendary_actions', name: 'Legendary Actions' }
				],
			}
		},
		mounted() {
			var npcs_ref = db.ref(`monsters`);
			npcs_ref.on('value', async (snapshot) => {
				let npcs = snapshot.val();

				let custom = db.ref(`npcs/${this.userId}`);
				custom.on('value', async (snapshot) => {
					let customNpcs = snapshot.val();
					for(let key in customNpcs) {
						npcs.push(customNpcs[key]);
					}
				});
				this.npcs = npcs;
				this.loadingNpcs = false;
			});
		},
		firebase() {
			return {
				abilities: db.ref('abilities'),
				npc: {
					source: db.ref(`npcs/${this.userId}/${this.npcId}`),
					asObject: true
				},
				// npcs: db.ref(`monsters`),
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
		},
		methods: {
			...mapActions([
				'fetchCampaign',
				'setSlide'
			]),
			isOwner() {
				if (this.$route.name == 'Edit Companion')
					return false
				return true
			},
			searchNPC() {
				this.searchResults = []
				this.searching = true
				for (var i in this.npcs) {
					var m = this.npcs[i]
					if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
						this.noResult = ''
						this.searchResults.push(m)
					}
				}
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
			},
			copy(npc) {
				this.npc = npc;
				this.npc.ac = npc.armor_class;
				this.npc.maxHp = npc.hit_points;
				
				//Delete unneeded
				delete this.npc.armor_class;
				delete this.npc.hit_points;
				delete this.npc.url;
				delete this.npc.index;
				delete this.npc._id;

				this.searchResults = [];
				this.search = '';
			},
			addNpc() {
				// THIS IS UGLY
				delete this.npc['.value']
				delete this.npc['.key']
				// UGLY ENDS HERE
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref('npcs/' + this.userId).push(this.npc);
						this.$router.replace('/npcs')
					} else {
						this.$snotify.error('There is something wrong in your form, scroll up to fix it.', 'Error', {
						});
					}
				})
			},
			editNpc() {
				// THIS IS UGLY
				delete this.npc['.key']
				// UGLY ENDS HERE
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`npcs/${this.userId}/${this.npcId}`).set(this.npc);
						if (this.isOwner()){
							this.$router.replace('/npcs')
						}
						else {
							this.$router.replace(`/characters/${this.npc.player_id}`)
						}
					} else {
						this.$snotify.error('There is something wrong in your form, scroll up to fix it.', 'Error', {
						});
					}
				})
			},
			add(type) {
				if(type == 'actions') {
					if(this.npc.actions == undefined) {
						this.npc.actions = [];
					}
					this.npc.actions.push({
						name: 'New Action',
					});
				}
				else if(type == 'legendary_actions') {
					if(this.npc.legendary_actions == undefined) {
						this.npc.legendary_actions = [];
					}
					this.npc.legendary_actions.push({
						name: 'New Legendary Action',
					});
				}
				else if(type == 'special_abilities') {
					if(this.npc.special_abilities == undefined) {
						this.npc.special_abilities = [];
					}
					this.npc.special_abilities.push({
						name: 'New Special Ability',
					});
				}
				this.$forceUpdate(); //IMPORTANT
			},
			remove(index, type) {
				if(type == 'actions'){
					this.$delete(this.npc.actions, index);
				}
				else if(type == 'special_abilities'){
					this.$delete(this.npc.special_abilities, index);
				}
				else if(type == 'legendary_actions'){
					this.$delete(this.npc.legendary_actions, index);
				}
				this.$forceUpdate(); //IMPORTANT
			},
			setQuick(input) {
				if(input == 0) {
					this.quick = false
				}
				else {
					this.quick = true
				}
			},
			returnString(name) {
				var str = name.toString()
				return str
			},
		}
	}
</script>

<style lang="scss" scoped>
.content {
	display: grid;
	height: calc(100vh - 50px) !important;
	grid-template-rows: auto 60px;

	.form {
		overflow-x: hidden;
		overflow-y: scroll;

		&::-webkit-scrollbar {
			display: none;
		}

		ul {
			padding: 0;

			&.entities {
				li {
					margin-bottom: 3px;
				}
			}
		}
		a.tab {
			display: inline-block;
			padding: 10px;
			margin-bottom: 1px;

			&.active {
				background-color: #262626;
				color: #b2b2b2 !important;
			}
		}
		.img-container, img {
			width: 100%;
		}
		label {
			line-height: 37px;
			margin-bottom: 0;

			svg {
				fill: #b2b2b2;
				width: 20px;
				height: 20px;
			}
		}
		.skills {
			line-height: 40px;
		}
	}
	.save {
		display: flex;
		justify-content: flex-end;
		padding: 10px 0;
		border-top: solid 1px #5c5757;

		.error {
			margin: 0 10px 0 0;
			line-height: 40px;
		}
	}
}



</style>