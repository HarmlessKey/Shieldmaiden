<template>
	<div v-if="base_values">
		<div
			class="content"
			:class="{
				medium: width <= 1100 && width > 576,
				small: width <= 576,
			}"
		>
			<q-scroll-area dark :thumb-style="{ width: '5px' }">
				<div class="tab-content" v-if="base_values.class">
					<!-- <General 
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
						:method="base_values.general.ability_score_method"
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
					/> -->
				</div>
			</q-scroll-area>
			<Computed :base_values="base_values" :modifiers="modifierArray" :computed="computed_values" />
		</div>
		<q-resize-observer @resize="setSize" />
	</div>
</template>

<script>
import { characterMixin } from "src/mixins/character.js";
import { experience } from "src/mixins/experience.js";
import { general } from "src/mixins/general.js";
import { dice } from "src/mixins/dice.js";
import { mapGetters, mapActions } from "vuex";
import { db } from "src/firebase";
import Computed from "src/components/characters/computed";
// import General from "src/components/characters/general";
// import Race from "src/components/characters/race";
// import Class from "src/components/characters/class";
// import Abilities from "src/components/characters/abilities";
// import Equipment from "src/components/characters/equipment";

export default {
	name: "EditCharacter",
	metaInfo: {
		title: "Character",
	},
	mixins: [characterMixin, experience, general, dice],
	components: {
		Computed,
		// General,
		// Race,
		// Class,
		// Abilities,
		// Equipment
	},
	data() {
		return {
			playerId: this.$route.params.id,
			advantage_disadvantage: {},
			base_values: {},
			width: 0,
		};
	},
	async beforeMount() {
		// Is it the user's character or someone elses
		if (this.$route.name === "EditCharacterAlpha") {
			let user = db.ref(
				`character_control/${this.$store.getters.user.uid}/${this.$route.params.id}`
			);
			user.on("value", (snapshot) => {
				this.userId = snapshot.val().user;
			});
		} else {
			this.userId = this.$store.getters.user.uid;
		}

		// Check wether the character is already in the store, fetch if not
		if (!this.characters[this.userId] || !this.characters[this.userId][this.playerId]) {
			await this.set_character({
				userId: this.userId,
				key: this.playerId,
			});
		}
		this.base_values = this.get_character(this.userId, this.playerId);

		if (
			!this.computed_characters[this.userId] ||
			!this.computed_characters[this.userId][this.playerId]
		) {
			this.compute("beforeMount");
		}
	},
	computed: {
		...mapGetters(["tier", "players"]),
		...mapGetters("characters", [
			"characters",
			"computed_characters",
			"get_character",
			"get_computed_character",
		]),
		computed_values() {
			return this.get_computed_character(this.userId, this.playerId);
		},
		race_modifiers() {
			return this.modifierArray(this.base_values.modifiers).filter((mod) => {
				const origin = mod.origin.split(".");
				return origin[0] === "race";
			});
		},
		class_modifiers() {
			return this.modifierArray(this.base_values.modifiers).filter((mod) => {
				const origin = mod.origin.split(".");
				return origin[0] === "class";
			});
		},
		equipment_modifiers() {
			return this.modifierArray(this.base_values.modifiers).filter((mod) => {
				const origin = mod.origin.split(".");
				return origin[0] === "equipment";
			});
		},
		ability_modifiers() {
			return this.modifierArray(this.base_values.modifiers).filter((mod) => {
				return mod.target === "ability";
			});
		},
	},
	methods: {
		...mapActions("characters", ["set_character", "set_computed_character"]),
		setSize(size) {
			this.width = size.width;
		},
		setBuildType() {
			db.ref(`characters_base/${this.userId}/${this.playerId}/general/build`).set(this.build);
		},
		compute(origin) {
			const computed = this.compute_character(this.base_values, origin);

			this.set_computed_character({
				userId: this.userId,
				key: this.playerId,
				character: computed,
			});
		},
	},
};
</script>

<style lang="scss" scoped>
.build-type {
	padding: 20px;

	> h3 {
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
