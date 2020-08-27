<template>
	<div v-if="base_values.general && !base_values.general.build" class="build-type">
		<h3>How do you want to build your character?</h3>
		<div class="types">
			<b-card header="Advanced" @click="build = 'advanced'" :class="{ active: build === 'advanced' }">
				<p>Create a complete character sheet that you can use as player in your games.</p>
				<template slot="footer">
					<a class="btn btn-block">Choose</a>
				</template>
			</b-card>
			<b-card header="Simple" @click="build = 'simple'" :class="{ active: build === 'simple' }">
				<p>Create a character with only basic stats needed for use in Harmless Key. This can't be used as a full character reference in your games, but just works for the our combat tracker.</p>
				<template slot="footer">
					<a class="btn btn-block">Choose</a>
				</template>
			</b-card>
			<b-card header="Import" @click="build = 'import'" :class="{ active: build === 'import' }">
				<p>Import a character from DnDBeyond. Copy your character sheet over, so it can be used in our combat tracker.</p>
				<template slot="footer">
					<a class="btn btn-block">Choose</a>
				</template>
			</b-card>
		</div>
		<div class="d-flex justify-content-center mt-5">
			<a class="btn btn-lg" @click="setBuildType('advanced')">Create character</a>
		</div>
	</div>

	<div v-else-if="base_values.general && base_values.general.build === 'advanced'" class="content">
		<ul class="tabs">
			<li 
				v-for="({value, label}, i) in tabs"
				@click="current_tab = value"
				:class="{ active: current_tab === value }"
				:key="`tab-${i}`"
			>
				{{ label }}
			</li>
		</ul>
		<div class="tab-content" v-if="base_values.class">
			<Computed 
				:computed="computed_values" 
			/>
			<General 
				v-if="current_tab === 'general'"
				:general="base_values.general" 
				:character_class="base_values.class"
				:playerId="playerId" 
				:userId="userId"
				@change="compute"
			/>
			<Race
				v-if="current_tab === 'race'"
				:character_race="base_values.race" 
				:playerId="playerId"
				:userId="userId"
				:modifiers="race_modifiers"
				@change="compute"
			/>
			<Class
				v-if="current_tab === 'class'"
				:base_class="base_values.class" 
				:hit_point_type="base_values.general.hit_point_type"
				:advancement="base_values.general.advancement"
				:playerId="playerId"
				:userId="userId"
				:modifiers="class_modifiers"
				:computed="computed_values"
				@change="compute"
			/>
			<Abilities
				v-if="current_tab === 'abilities'"
				:base_abilities="base_values.abilities"
				:playerId="playerId"
				:userId="userId"
				:modifiers="ability_modifiers"
				@change="compute"
			/>
		</div>
	</div>
</template>

<script>
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import { experience } from '@/mixins/experience.js';
	import { general } from '@/mixins/general.js';
	import { dice } from '@/mixins/dice.js';
	import { spellSlots } from '@/mixins/spellSlots.js';
	import { skills } from '@/mixins/skills.js';
	import { mapGetters, mapActions } from 'vuex';
	import { db } from '@/firebase';
	import Computed from './computed';
	import General from './general';
	import Race from './race';
	import Class from './class';
	import Abilities from './abilities';
	

	export default {
		name: 'Players',
		metaInfo: {
			title: 'Character'
		},
		mixins: [experience, general, dice, spellSlots, skills],
		components: {
			OverEncumbered,
			Computed,
			General,
			Race,
			Class,
			Abilities
		},
		data() {
			return {
				playerId: this.$route.params.id,
				build: 'advanced',
				tabs: [
					{ value: 'general', label: "General" },
					{ value: 'race', label: "Race" },
					{ value: 'class', label: "Class" },
					{ value: 'abilities', label: "Abilities" },
					{ value: 'equipment', label: "Equipment" },
					{ value: 'actions', label: "Actions" },
					{ value: 'background', label: "Background" },
				],
				current_tab: 'general'
			}
		},
		firebase() {
			return {
				base_values: {
					source: db.ref(`characters_base/${this.userId}/${this.playerId}`),
					asObject: true
				},
				computed_values: {
					source: db.ref(`characters_computed/${this.userId}/${this.playerId}`),
					asObject: true
				},
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'players',
				'overencumbered',
			]),
			//User ID needs to be different if it is
			//an external controlled character
			userId() {
				if(this.$route.name === 'Edit Character') {
					let id = undefined
					let user = db.ref(`character_control/${this.$store.getters.getUser.uid}/${this.$route.params.id}`);
					user.on('value' , (snapshot) => {
						id = snapshot.val().user
					});
					return id;
				} else {
					return this.$store.getters.getUser.uid;
				}
			},
			//Turn modifiers into an array, but save the keys
			modifiers() {
				if(this.base_values.modifiers) {
					let returnArray = [];
					for(const [key, value] of Object.entries(this.base_values.modifiers)) {
						let mod = value;
						mod['.key'] = key;
						returnArray.push(mod);
					}
					return returnArray;
				} return [];
			},
			race_modifiers() {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[0] === 'race';
				});
				return modifiers;
			},
			class_modifiers() {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[0] === 'class';
				});
				return modifiers;
			},
			feat_modifiers() {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[0] === 'feat';
				});
				return modifiers;
			},
			ability_modifiers() {
				const modifiers = this.modifiers.filter(mod => {
					return mod.target === 'ability';
				});
				return modifiers;
			},
			saving_throw_modifiers() {
				const modifiers = this.modifiers.filter(mod => {
					return mod.target === 'saving_throw';
				});
				return modifiers;
			},
			ac_modifiers() {
				const modifiers = this.modifiers.filter(mod => {
					return mod.target === 'ac';
				});
				return modifiers;
			},
			skill_modifiers() {
				const modifiers = this.modifiers.filter(mod => {
					return mod.target === 'skill';
				});
				return modifiers;
			},
			speed_modifiers() {
				const modifiers = this.modifiers.filter(mod => {
					return mod.target === 'speed';
				});
				return modifiers;
			},
			initiative_modifiers() {
				const modifiers = this.modifiers.filter(mod => {
					return mod.target === 'initiative';
				});
				return modifiers;
			}
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			showSlide(type) {
				this.setSlide({
					show: true,
					type,
				})
			},
			setBuildType() {
				db.ref(`characters_base/${this.userId}/${this.playerId}/general/build`).set(this.build);
			},
			compute(origin) {
				// eslint-disable-next-line
				console.log("change made, compute charachter", origin);
				origin = origin.split(".");

				const hit_point_type = this.base_values.general.hit_point_type;

				//Ability score maximums
				let ability_max = {
					strength: 20,
					dexterity: 20,
					constitution: 20,
					intelligence: 20,
					wisdom: 20,
					charisma: 20
				}

				//Ability Scores
				let ability_scores = { ...this.base_values.abilities };

				//Add Ability Score Modifiers
				for(const [key, value] of Object.entries(ability_scores)) {
					for(const modifier of this.ability_modifiers) {
						if(modifier.subtarget === key && modifier.type === 'bonus') {
							ability_scores[key] = value + parseInt(modifier.value);
						}
					}

					//Set score to maximum if it is higher than it's maximum
					if(ability_scores[key] > ability_max[key]) {
						ability_scores[key] = ability_max[key];
					}
				}
				//Save Ability Scores
				db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/abilities`).update(ability_scores);

				/**
				 * 
				 * TODO!
				 * Ability Set Score Modifiers
				 * 
				 **/


				//Level HP and Spells
				let classes = {};
				let computed_level = 0;
				let computed_hp = (this.base_values.class.classes.main.base_hit_points) ? this.base_values.class.classes.main.base_hit_points : 0;
				let caster_multilevel = 0; //For multiclassing in multiple casters you need a caster level (phb 164)
				let spell_slots;

				//Set level specific stats HP/Spells
				for(const [key, value] of Object.entries(this.base_values.class.classes)) {
					const level = value.level;
					computed_level = computed_level + level;
					
					//Create class object for sheet
					classes[key] = {
						class: value.name,
						level
					}
					
					//Check if the HP is rolled
					if(hit_point_type === 'rolled' && value.rolled_hit_points) {
						let totalRolled = 0;
						for(const [key, rolled] of Object.entries(value.rolled_hit_points)) {
							if(value.level >= key && rolled) {
								totalRolled = totalRolled + parseInt(rolled);
							}
						}
						computed_hp = computed_hp + parseInt(totalRolled);
					} else if(hit_point_type === 'fixed' && value.hit_dice) {
						const hit_dice = this.dice_types.filter(die => {
							return die.value === value.hit_dice;
						});
						computed_hp = computed_hp + ((level - 1) * hit_dice[0].average);
					}

					//Spell slots
					if(value.caster_type) {
						//For multiclassing in multiple casters the total caster level changes depening on the caster type (pbp 164)
						let multiplier = 1;
						if(value.caster_type === 'half') {
							multiplier = 2;
						} else if(value.caster_type === 'third') {
							multiplier = 3;
						}

						caster_multilevel = caster_multilevel + Math.floor(level/multiplier);
						spell_slots = this.spell_slot_tables[value.caster_type][level];
						classes[key].spells_known = this.base_values.class.classes[key].spells_known.spells[level] || 0;
						classes[key].cantrips_known = this.base_values.class.classes[key].spells_known.cantrips[level] || 0;
					}
				}
				//save classes
				db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/classes`).set(classes);

				//Save total level
				db.ref(`characters_computed/${this.userId}/${this.playerId}/display/level`).set(computed_level);

				//Check if multiclassed in multiple casters, then use the caster_multilevel and full caster spell slot table (phb 164)
				if(caster_multilevel > 1) {
					spell_slots = this.spell_slot_tables.full[caster_multilevel];
				}
				//Save spell slots
				if(spell_slots) {
					db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/spell_slots`).set(spell_slots);
				}

				//Add CON modifier * level to computed HP
				computed_hp = computed_hp + (computed_level * this.calcMod(ability_scores.constitution));
				db.ref(`characters_computed/${this.userId}/${this.playerId}/display/hit_points`).set(computed_hp);

				//Set proficiency bonus
				const proficiency = this.xpTable[computed_level].proficiency;
				db.ref(`characters_computed/${this.userId}/${this.playerId}/display/proficiency`).set(proficiency);

				//Set spellcasting variables Spell Attack / Spell Save DC
				//Proficiency bonus is needed for this
				for(const [key, value] of Object.entries(this.base_values.class.classes)) {
					if(value.casting_ability) {
						classes[key].spell_attack = proficiency + this.calcMod(ability_scores[value.casting_ability]);
						classes[key].spell_save_dc = 8 + proficiency + this.calcMod(ability_scores[value.casting_ability]);
					}
				}
				//Update classes
				db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/classes`).update(classes);
				
				//Initiative
				let initiative = this.calcMod(ability_scores.dexterity);

				//Add Initiative Modifiers	
				for(const modifier of this.initiative_modifiers) {
					initiative = this.addModifier(initiative, modifier, proficiency, ability_scores);
				}
				db.ref(`characters_computed/${this.userId}/${this.playerId}/display/initiative`).set(initiative);

				//Armor Class
				let armor_class = 10; //Base is always 10 (phb 14)

				//Check if armor is equiped

				armor_class = armor_class + this.calcMod(ability_scores.dexterity);

				//Add AC Modifiers	
				for(const modifier of this.ac_modifiers) {
					armor_class = this.addModifier(armor_class, modifier, proficiency, ability_scores);
				}
				db.ref(`characters_computed/${this.userId}/${this.playerId}/display/armor_class`).set(armor_class);

				//Speed
				let speed = (this.base_values.race.walking_speed) ? parseInt(this.base_values.race.walking_speed) : 0;

				//Add Speed Modifiers	
				for(const modifier of this.speed_modifiers) {
					speed = this.addModifier(speed, modifier, proficiency, ability_scores);
				}
				db.ref(`characters_computed/${this.userId}/${this.playerId}/display/speed`).set(speed);

				//Skills
				let skills = {
					proficiencies: {},
					expertise: {},
					bonuses: {}
				};
				for(const skill in this.skillList) {
					for(const modifier of this.skill_modifiers) {
						//Save skill proficiencies as a boolean, don't save the bonus
						//This get's calculated front end, same goes for expertise
						//This way expertise can easily only be added if the proficiency is also true
						//It's also easier to show front-end what skills have proficiency and expertise
						if(skill === modifier.subtarget) {
							if(modifier.type === "proficiency") {
								skills.proficiencies[skill] = true;
							} else if(modifier.type === "expertise") {
								skills.expertise[skill] = true;
							} else {
								let value = (skills.bonuses[skill]) ? skills.bonuses[skill] : 0;
								skills.bonuses[skill] = this.addModifier(value, modifier, proficiency, ability_scores);
							}
						}
					}
				}
				db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/skills`).set(skills);

				//Saving throws
				let saving_throws = {
					proficiencies: {},
					bonuses: {}
				};
				for(const ability in ability_scores) {
					for(const modifier of this.saving_throw_modifiers) {
						//Save saving throw proficiencies as a boolean, don't save the bonus
						//This get's calculated front end
						//This way it's easy tho show what saving throws have proficiency
						if(ability === modifier.subtarget) {
							if(modifier.type === "proficiency") {
								saving_throws.proficiencies[ability] = true;
							} else {
								let value = (saving_throws.bonuses[ability]) ? saving_throws.bonuses[ability] : 0;
								saving_throws.bonuses[ability] = this.addModifier(value, modifier, proficiency, ability_scores);
							}
						}
					}
				}
				db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/saving_throws`).set(saving_throws);

				//Senses, passive checks phb (175)
				let senses = {
					perception: 10,
					investigation: 10,
					insight: 10
				}
				for(const [skill, value] of Object.entries(senses)) {
					//Ad ability modifier
					if(skill === 'investigation') {
						this.$set(senses, skill, (value + this.calcMod(ability_scores['intelligence'])));
					} else {
						this.$set(senses, skill, (value + this.calcMod(ability_scores['wisdom'])));
					}

					//Add proficiency
					if(skills.proficiencies[skill]) {
						this.$set(senses, skill, (senses[skill] + proficiency))
					}
				}
				db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/senses`).set(senses); 

				//Clear the proficiency tracker
				this.proficiency_tracker = [];
			},
			addModifier(value, modifier, proficiency, ability_scores) {
				let newValue = parseInt(value);
 
				if(modifier.type === 'bonus') {
					newValue = newValue + parseInt(modifier.value);
				}
				if(modifier.type === 'proficiency') {
					//Keep track of what subtargets have had proficiency added
					//proficiency can only be added once
					let added_before = false;
					for(const prof of this.proficiency_tracker) {
						if(prof === `${modifier.target}.${modifier.subtarget}`) {
							added_before = true;
						}
					}
					//If proficiency wasn't added before, add it and track that it was added
					if(!added_before) {
						newValue = newValue + parseInt(proficiency);
						this.proficiency_tracker.push(`${modifier.target}.${modifier.subtarget}`);
					}
				}
				if(modifier.type === 'ability') {
					newValue = newValue + this.calcMod(ability_scores[modifier.ability_modifier]);
				}
				return newValue;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.build-type {
		padding: 20px;
		
		> h3 {
			text-align: center;
			margin-bottom: 30px;
		}

		.types {
			display: flex;
			justify-content: center;
			margin: -10px;

			.card {
				border: solid 1px transparent !important;
				max-width: 200px;
				margin: 10px;
				
				.card-footer {
					padding: 0;
					border: none;
				}
				&.active {
					border-color: #2c97de !important;
				}
			}
		}
	}
	.content {
		background-image: url('../../../../assets/_img/styles/paper-bg.png');
		background-position: top left;
		display: grid;
		grid-template-rows: 30px 1fr;
		overflow: hidden;
		height: calc(100vh - 60px);
		background-color: #000;
		
		.tabs {
			height: 30px;
			list-style: none;
			padding: 0;
			display: flex;
			justify-content: flex-start;
			user-select: none;
			border-bottom: solid 1px #5c5757;

			li {
				cursor: pointer;
				padding: 0 10px;

				&.active {
					color: #2c97de;
				}
				&:first-child {
					padding-left: 0;
				}
			}
		}
		.tab-content {
			padding-top: 20px;
			overflow: scroll;

			&::-webkit-scrollbar {
				display: none !important;
			}
		}
		
	}
</style>