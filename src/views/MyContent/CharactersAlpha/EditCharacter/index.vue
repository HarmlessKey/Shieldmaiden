<template>
	<div v-if="base_values">
		<div v-if="base_values.general && !base_values.general.build" class="build-type">
			<h3>How do you want to do this?</h3>
			<div class="types">
				<hk-card class="pointer" header="Advanced" @click="build = 'advanced'" :class="{ active: build === 'advanced' }">
					<p>Create a complete character sheet that you can use as a player in your games.</p>
					<div @click="build = 'advanced'" class="card-footer" slot="footer">
						<a>Select</a>
					</div>
				</hk-card>
				<hk-card class="pointer" header="Simple" @click="build = 'simple'" :class="{ active: build === 'simple' }">
					<p>
						Create a character with only basic stats needed for use in Harmless Key. 
						This can't be used as a full character reference in your games, 
						but just works for our combat tracker.
					</p>
					<div @click="build = 'simple'" class="card-footer" slot="footer">
						<a>Select</a>
					</div>
				</hk-card>
				<hk-card class="disabled" header="Import">
					<p>(Coming soon)</p>
					<p>
						Import a character from DnDBeyond. 
						Copy your character sheet over, 
						so it can be used in our combat tracker.
					</p>
					<div class="card-footer" slot="footer">
						<a class="disabled">Select</a>
					</div>
				</hk-card>
			</div>
			<div class="d-flex justify-content-center mt-5">
				<a class="btn btn-lg" @click="setBuildType('advanced')">Create {{ build }} character</a>
			</div>
		</div>

		<div 
			v-else-if="base_values.general && base_values.general.build === 'advanced'"
			class="content"
			:class="{
				medium: width <= 1100 && width > 576,
				small: width <= 576
			}"
		>
			<div class="tabs">
				<router-link to="/players">
				<i class="fas fa-chevron-left mr-1" />
					Back
				</router-link>
				<q-tabs
					v-model="current_tab"
					dark
					align="left"
					no-caps
				>
					<q-tab 
						v-for="({value, label}, i) in tabs" 
						:name="value"
						:label="label"
						:key="`tab-${i}`"
					/>
				</q-tabs>
			</div>
			<q-scroll-area dark :thumb-style="{ width: '5px'}"> 
				<div class="tab-content" v-if="base_values.class">
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
						:computed="computed_values.sheet.abilities"
						:playerId="playerId"
						:userId="userId"
						:modifiers="ability_modifiers"
						@change="compute"
					/>
					<Equipment
						v-if="current_tab === 'equipment'"
						:playerId="playerId"
						:userId="userId"
						:equipment="computed_values.equipment"
						:modifiers="equipment_modifiers"
						:proficiencies="computed_values.sheet.proficiencies"
						@change="compute"
					/>
				</div>
			</q-scroll-area>
			<Computed 
				:base_values="base_values"
				:modifiers="modifierArray"
				:computed="computed_values"
			/>
		</div>
		<q-resize-observer @resize="setSize" />
	</div>
</template>

<script>
	import OverEncumbered from "@/components/OverEncumbered.vue";
	import { characterMixin } from "@/mixins/character.js";
	import { experience } from "@/mixins/experience.js";
	import { general } from "@/mixins/general.js";
	import { dice } from "@/mixins/dice.js";
	import { spellSlots } from "@/mixins/spellSlots.js";
	import { skills } from "@/mixins/skills.js";
	import { mapGetters, mapActions } from "vuex";
	import { db } from "@/firebase";
	import Computed from "@/components/characters/computed";
	import General from "@/components/characters/general";
	import Race from "@/components/characters/race";
	import Class from "@/components/characters/class";
	import Abilities from "@/components/characters/abilities";
	import Equipment from "@/components/characters/equipment";
	
	export default {
		name: "Players",
		metaInfo: {
			title: "Character"
		},
		mixins: [characterMixin, experience, general, dice, spellSlots, skills],
		components: {
			OverEncumbered,
			Computed,
			General,
			Race,
			Class,
			Abilities,
			Equipment
		},
		data() {
			return {
				playerId: this.$route.params.id,
				advantage_disadvantage: {},
				base_values: {},
				width: 0,
				build: "advanced",
				tabs: [
					{ value: "general", label: "General" },
					{ value: "race", label: "Race" },
					{ value: "class", label: "Class" },
					{ value: "abilities", label: "Abilities" },
					{ value: "equipment", label: "Equipment" },
					{ value: "actions", label: "Actions" },
					{ value: "background", label: "Background" },
				],
				current_tab: "general"
			}
		},
		async beforeMount() {
			// Is it the user's character or someone elses
			if(this.$route.name === "Edit Character") {
				let user = db.ref(`character_control/${this.$store.getters.user.uid}/${this.$route.params.id}`);
				user.on("value" , (snapshot) => {
					this.userId = snapshot.val().user
				});
			} else {
				this.userId = this.$store.getters.user.uid;
			}

			// Check wether the character is already in the store, fetch if not
			if(!this.characters[this.userId] || !this.characters[this.userId][this.playerId]) {
				await this.set_character({
					userId: this.userId, 
					key: this.playerId
				});	
			}
			this.base_values = this.get_character(this.userId, this.playerId);

			if(!this.computed_characters[this.userId] || !this.computed_characters[this.userId][this.playerId]) {				
				this.compute("beforeMount")
			}
		},
		computed: {
			...mapGetters([
				"tier",
				"players",
				"overencumbered",
				"characters",
				"computed_characters",
				"get_character",
				"get_computed_character"
			]),
			computed_values() {
				return this.get_computed_character(this.userId, this.playerId);
			},
			race_modifiers() {
				const modifiers = this.modifierArray(this.base_values.modifiers).filter(mod => {
					const origin = mod.origin.split(".");
					return origin[0] === 'race';
				});
				return modifiers;
			},
			class_modifiers() {
				const modifiers = this.modifierArray(this.base_values.modifiers).filter(mod => {
					const origin = mod.origin.split(".");
					return origin[0] === 'class';
				});
				return modifiers;
			},
			equipment_modifiers() {
				const modifiers = this.modifierArray(this.base_values.modifiers).filter(mod => {
					const origin = mod.origin.split(".");
					return origin[0] === 'equipment';
				});
				return modifiers;
			},
			ability_modifiers() {
				const modifiers = this.modifierArray(this.base_values.modifiers).filter(mod => {
					return mod.target === 'ability';
				});
				return modifiers;
			}
		},
		methods: {
			...mapActions([
				"set_character",
				"set_computed_character"
			]),
			setSize(size) {
				this.width = size.width;
			},
			setBuild(type) {
				this.build = type;
			},
			setBuildType() {
				db.ref(`characters_base/${this.userId}/${this.playerId}/general/build`).set(this.build);
			},
			compute(origin) {		
					const computed = this.compute_character(this.base_values, origin);
	
					this.set_computed_character({
						userId: this.userId,
						key: this.playerId,
						character: computed
					});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.build-type {
		padding: 20px;
		
		> h3 {
			font-family: 'Fredericka the Great', cursive !important;
			text-align: center;
			font-size: 25px !important;
			margin: 40px 0 30px 0 !important;
		}

		.types {
			display: flex;
			justify-content: center;
			margin: -10px;

			.hk-card {
				border: solid 1px transparent !important;
				max-width: 200px;
				margin: 10px;
				user-select: none;
				
				.card-footer {
					a {
						text-align: center;
						display: block;
					}
				}
				&.active {
					border-color: #2c97de !important;
				}
			}
		}
	}
	.content {
		padding: 0 !important;
		height: calc(100vh - 98px);

		.tabs {
			display: flex;
			justify-content: flex-start;
			background: #191919;
			width: calc(100% - 48px);

			a {
				line-height: 48px;
				padding: 0 15px;
			}
		}
		.q-scrollarea {
			height: 100%;
		}
		.tab-content {
			margin: auto;
			padding: 20px;
			max-width: 960px;
		}
	}
</style>