<template>
	<div v-if="overencumbered" class='container'>
		<OverEncumbered/>
	</div>
	<div class="content" v-else-if="npc || $route.name == 'AddNPC'">
		<div class="form">
			<a class="tab" :class="{ active: !quick }" @click="setQuick(0)">Complete Build</a>
			<a class="tab" :class="{ active: quick }" @click="setQuick(1)">Quick Build</a>

			<hk-card header="Copy Existing NPC" v-if="$route.name == 'AddNPC'">
				<q-input 
					dark filled square dense
					label="Search NPC"
					type="text" 
					autocomplete="off" 
					v-model="search" 
					@keyup="searchNPC()"
					class="mb-3"
				>
					<template v-slot:append>
						<q-icon name="fas fa-search" size="xs" @click="searchNPC()" />
					</template>
				</q-input>
				<ul class="entities">
					<p v-if="noResult" class="red">{{ noResult }}</p>
					<li v-for="(npc, index) in searchResults" :key="index" class="d-flex justify-content-between">
						<div class="d-flex justify-content-left">
							<a @click="setSlide({show: true, type: 'ViewEntity', data: npc})" class="mr-2">
								<i class="fas fa-info-circle"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Show info
								</q-tooltip>
							</a>
							{{ npc.name }}
						</div>
						<a class="gray-hover" @click="copy(npc)">
							<i class="fas fa-copy blue"></i>
							<span class="d-none d-md-inline ml-1">Copy</span>
							<q-tooltip anchor="top middle" self="center middle">
								Copy NPC
							</q-tooltip>
						</a>
					</li>
				</ul>
			</hk-card>
			
			<hk-card header="Basic Info">
				<!-- NAME -->
				<q-input 
					dark filled square dense
					label="Name"
					autocomplete="off"  
					type="text" 
					class="mb-2" 
					v-model="npc.name" 
					v-validate="'max:35|required'" 
					maxlength="35"
					data-vv-as="Name"
					name="name" 
				/>
				<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>

				<!-- SIZE -->
				<q-input 
					v-if="!quick"
					dark filled square dense
					label="Size"
					autocomplete="off" 
					type="text" 
					class="mb-2" 
					v-model="npc.size"
					maxlenght="30"
					name="size" 
				/>
				
				<!-- TYPE -->
				<div class="row q-col-gutter-md" v-if="!quick">
					<div class="col-12 col-md-6">
						<q-input 
							dark filled square dense
							label="Type"
							autocomplete="off" 
							type="text" 
							class="mb-2" 
							v-model="npc.type" 
							name="type" 
							id="type"
						/>
					</div>
					<div class="col-12 col-md-6">
						<q-input 
							dark filled square dense
							label="Subtype"
							autocomplete="off" 
							type="text"
							class="mb-2"
							v-model="npc.subtype" 
							name="subtype" 
							id="subtype"
							placeholder="Subtype"
						/>
					</div>
				</div>

				<!-- ALIGNMENT -->
				<q-input 
					v-if="!quick"
					dark filled square dense
					label="Alignment"
					autocomplete="off" 
					type="text" 
					class="mb-2" 
					v-model="npc.alignment" 
					name="alignment" 
					placeholder="Alignment"
				/>

				<!-- SPEED -->
				<q-input 
					dark filled square dense
					label="Speed"
					autocomplete="off"  
					type="text" 
					class="mb-2" 
					v-model="npc.speed" 
					name="speed" 
					placeholder="Speed"
				/>

				<!-- SENSES -->
				<q-input 
					dark filled square dense
					label="Senses"
					v-if="!quick"
					autocomplete="off"
					type="text" 
					class="mb-2" 
					v-model="npc.senses" 
					name="senses" 
					placeholder="Senses"
				/>

				<!-- LANGUAGES -->
				<q-input 
					dark filled square dense
					label="Languages"
					v-if="!quick"
					autocomplete="off" 
					type="text" 
					class="mb-2" 
					v-model="npc.languages" 
					name="Languages" 
					id="languages"
					placeholder="Languages"
				/>

				<!-- CR -->
				<q-select 
					dark filled square dense
					label="Challenge rating"
					v-model="npc.challenge_rating" 
					class="mb-2"
					:options="[0]"
				>
					<template v-slot:option>
						<q-list dark>
							<q-item clickable v-ripple v-close-popup @click="npc.challenge_rating = 0, $forceUpdate()">0</q-item>
							<q-item clickable v-ripple v-close-popup @click="npc.challenge_rating = 0.125, $forceUpdate()">1/8</q-item>
							<q-item clickable v-ripple v-close-popup @click="npc.challenge_rating = 0.25, $forceUpdate()">1/4</q-item>
							<q-item clickable v-ripple v-close-popup @click="npc.challenge_rating = 0.5, $forceUpdate()">1/2</q-item>
							<q-item 
								v-for="index in 24"
								:key="`cr-${index}`"
								clickable v-ripple v-close-popup 
								@click="npc.challenge_rating = index, $forceUpdate()"
							>
								{{ index }}
							</q-item>
							<q-item clickable v-ripple v-close-popup @click="npc.challenge_rating = 30, $forceUpdate()">30</q-item>
						</q-list>
					</template>
				</q-select>

				<!-- AVATAR -->
				<div class="avatar">
					<div class="img" v-if="npc.avatar" :style="{ backgroundImage: 'url(\'' + npc.avatar + '\')' }"></div>
					<div class="img" v-else>
						<img src="@/assets/_img/styles/monster.svg" />
					</div>
					<div>
						<q-input 
							dark filled square
							label="Avatar"
							autocomplete="off"  
							type="text" 
							class="mb-2" 
							:class="{'input': true, 'error': errors.has('avatar') }" 
							v-model="npc.avatar" 
							v-validate="'url'" 
							data-vv-as="Avatar"
							name="avatar" 
							placeholder="Image URL"
						/>
						<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>
					</div>
				</div>

				<!-- FRIENDLY NPC -->
				<q-checkbox size="lg" dark v-model="npc.friendly" label="Add as friendly" :false-value="null" indeterminate-value="something-else" />
			</hk-card>

			<hk-card header="Health & Armor Class">
				<div class="row q-col-gutter-md">
					<div class="col-12 col-md-4">
						<q-input 
							dark filled square dense
							label="Armor class"
							autocomplete="off"  
							type="number" 
							class="mb-2" 
							v-model="npc.ac" 
							v-validate="'required'" 
							name="ac" 
							data-vv-as="Armor class"
						>
							<template v-slot:append>
								<q-icon name="fas fa-shield" size="xs" />
							</template>
						</q-input>
						<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
					</div>
					<div class="col-12 col-md-4">
						<q-input 
							dark filled square dense
							label="Hit points"
							autocomplete="off"  
							type="number" 
							class="mb-2" 
							:class="{'input': true, 'error': errors.has('Hit Points') }" 
							v-model="npc.maxHp" 
							v-validate="'required'" 
							name="hp" 
							data-vv-as="Hit Points"
						>
							<template v-slot:append>
								<q-icon name="fas fa-heart" size="xs" />
							</template>
						</q-input>
						<p class="validate red" v-if="errors.has('hp')">{{ errors.first('hp') }}</p>
					</div>
					<div class="col-12 col-md-4" v-if="!quick">
						<q-input 
							dark filled square dense
							label="Hit dice"
							autocomplete="off" 
							type="text" 
							class="mb-2" 
							v-model="npc.hit_dice"  
							v-validate="{ regex:/^[0-9]+d[0-9]+$/ }"
							name="hit_dice" 
							id="hitdice"
							data-vv-as="Hit Dice"
						>
							<template v-slot:append>
								<small>{{ npc.hit_dice ? `(${hitDiceStr(npc)})` : '' }}</small>
								<q-icon name="info" size="xs">
									<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
										<q-card dark square>
											<q-card-section class="bg-gray-active">
												<b>Hit Dice + Modifier</b>
											</q-card-section>
											<q-card-section>
												The modifier is the NPC's Constitution modifier multiplied by the number of hit dice.
											</q-card-section>
										</q-card>
									</q-menu>
								</q-icon>
							</template>				
						</q-input>
						<p class="validate red" 
							v-if="errors.has('hit_dice')">
							{{ errors.first('hit_dice') }}
							Allowed format: "2d6".
						</p>
					</div>
				</div>
			</hk-card>

			<!-- ABILITY SCORES -->
			<hk-card header="Ability Scores">
				<div class="row q-col-gutter-md">
					<div v-for="(ability, index) in abilities" :key="index" class="col-4 col-md-2 mb-2">
						<q-input 
							dark filled square dense
							:label="ability.ability.capitalize()"
							autocomplete="off"  
							type="number" 
							v-model="npc[ability.ability]" 
							:name="ability.ability"
						/>
					</div>
				</div>
			</hk-card>

			<!-- SAVING THROWS -->
			<hk-card header="Saving Throws" v-if="!quick">
				<div class="row q-col-gutter-md">
					<div v-for="(ability, index) in abilities" :key="index" class="col-4 col-md-2 mb-2">
						<q-input 
							dark filled square dense
							:label="ability.ability.capitalize()"
							autocomplete="off"  
							type="number" 
							v-model="npc[ability.ability+'_save']" 
							:name="ability.ability"
						/>
					</div>
				</div>
			</hk-card>

			<!-- SKILLS -->
			<hk-card v-if="!quick" header="Skills">
				<div class="skills">
					<q-input
						dark filled square dense
						:label="skill.capitalize()"
						v-for="(skill, index) in skills" 
						:key="index"
						autocomplete="off"
						type="number" 
						class="mb-2" 
						v-model="npc[skill]" 
					/>
				</div>
			</hk-card>
			
			<!-- DEFENSES -->
			<hk-card header="Resistances & Vulnerabilities" v-if="!quick">
				<q-input 
					dark filled square dense
					label="Damage vulnerabilities"
					autocomplete="off"  
					type="text"
					class="mb-2" 
					v-model="npc.damage_vulnerabilities" 
					name="damage_vulnerabilities" 
				/>

				<q-input 
					dark filled square dense
					label="Damage resistances"
					autocomplete="off"  
					type="text" 
					class="mb-2" 
					v-model="npc.damage_resistances" 
					name="damage_resistances" 
				/>

				<q-input 
					dark filled square dense
					label="Damage immunities"
					autocomplete="off"  
					type="text" 
					class="mb-2" 
					v-model="npc.damage_immunities" 
					name="damage_immunities"
				/>

				<q-input 
					dark filled square dense
					label="Condition immunities"
					autocomplete="off"  
					type="text" 
					class="mb-2" 
					v-model="npc.condition_immunities" 
					name="condition_immunities" 
				/>
			</hk-card>

			<!-- ACTIONS / ABILITIES -->
			<hk-card v-for="(action, index) in actions" :key="index">
				<div slot="header" class="card-header d-flex justify-content-between">
					{{ action.name }}
					<a class="gray-hover text-capitalize" @click="add(action.type)">
						<i class="fas fa-plus green"></i>
						<span class="d-none d-md-inline ml-1">Add</span>
						<q-tooltip anchor="top middle" self="center middle">
							Add {{ action.name }}
						</q-tooltip>
					</a>
				</div>

				<q-list dark square :class="`accordion`">
					<q-expansion-item
						v-for="(ability, index) in npc[action.type]" 
						:key="index"
						dark switch-toggle-side
						:group="action.name"
					>
						<template v-slot:header>
							<q-item-section>
								{{ index + 1 }}. {{ ability.name }}
							</q-item-section>
							<q-item-section avatar>
								<a @click="remove(index, action.type)" class="remove">
									<i class="fas fa-trash-alt red" />
									<q-tooltip anchor="top middle" self="center middle">
										Remove
									</q-tooltip>
								</a>
							</q-item-section>
						</template>

						<div class="accordion-body">
							<div>
								<q-input 
									dark filled square dense
									label="Name"
									autocomplete="off" 
									id="name"
									type="text" 
									class="mb-2" 
									maxlength="30"
									v-model="ability.name" 
									name="name" 
									placeholder="Name"
								/>
								<q-input 
									dark filled square dense
									label="Damage dice"
									autocomplete="off" 
									type="text" 
									class="mb-2" 
									v-model="ability.damage_dice" 
									:name="'damage_dice_'+action.type+index"
									data-vv-as="Damage Dice"
									placeholder="Damage Dice"
									v-validate="{ regex:/^[0-9]+d[0-9]+(\+[0-9]+d[0-9]+)*$/ }"
								/>
								<p class="validate red" 
									v-if="errors.has('damage_dice_'+action.type+index.toString())">
									{{ errors.first('damage_dice_'+action.type+index.toString()) }}
									Allowed format: "2d6" or "2d6+1d8".
								</p>

								<q-input 
									dark filled square dense
									label="Damage bonus"
									autocomplete="off" 
									id="damage_bonus"
									type="number" 
									class="mb-2" 
									v-model="ability.damage_bonus" 
									name="damage_bonus" 
									placeholder="Damage Bonus"
								/>

								<q-input 
									dark filled square dense
									label="Attack/to hit bonus"
									autocomplete="off" 
									id="attack_bonus"
									type="number" 
									class="mb-2" 
									v-model="ability.attack_bonus" 
									name="attack_bonus" 
									placeholder="Attack Bonus"
								/>
								<q-input
									dark filled square dense
									label="Description"
									v-model="ability.desc" 
									name="desc" 
									autogrow
								/>
							</div>
						</div>
					</q-expansion-item>
				</q-list>
			</hk-card>
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
		.avatar {
			display: grid;
			grid-template-columns: 56px 1fr;
			grid-column-gap: 10px;

			.img {
				border: solid 1px #b2b2b2;
				width: 56px;
				height: 56px;
				background-size: cover;
				background-position: center top;
			}
		}
		.skills {
			columns: 2;
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