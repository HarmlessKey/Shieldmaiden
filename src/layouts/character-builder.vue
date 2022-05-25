<template>
	<div v-if="!loading">
		<build-type-select 
			v-if="character.build === 'new'"
			:user-id="userId"
			:character-id="characterId"
		/>
	
		<div 
			v-else-if="character.build === 'advanced'"
			class="row q-col-gutter-md content__edit"
		>
			<div class="col-12" :class="{ 'col-md-9': width > 978 }">
				<div class="tabs">
					<q-tabs
						v-model="current_tab"
						dark
						inline-label
						align="left"
						no-caps
					>
						<q-route-tab
							v-for="({value, label, icon}, i) in tabs" 
							exact replace
							:icon="icon"
							:label="label"
							:name="value"
							:to="`/content/characters-alpha/${characterId}/${value}`"
							:key="`tab-${i}`"
						/>
					</q-tabs>
					<router-view
						:character-id="characterId"
						:user-id="userId"
					/>
				</div>
			</div>
			<div class="col-12 col-md-3" v-if="width > 978">
				<Computed />
			</div>
		</div>
		<q-resize-observer @resize="setSize" />
	</div>
</template>

<script>
	import { mapActions } from "vuex";
	import { characterMixin } from "src/mixins/character.js";
	import BuildTypeSelect from "src/components/characters/build-type-select";
	import Computed from "src/components/characters/computed";
	import { Character } from "src/classes/character";

	export default {
		name: "CharacterBuilderLayout",
		mixins: [characterMixin],
		components: {
			BuildTypeSelect,
			Computed
		},
		data() {
			return {
				userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
				characterId: this.$route.params.id,
				loading: true,
				character: {},
				width: 0,
				tabs: [
					{ value: "general", label: "General" },
					{ value: "race", label: "Race" },
					{ value: "class", label: "Class" },
					{ value: "abilities", label: "Abilities" },
					{ value: "equipment", label: "Equipment" },
					{ value: "actions", label: "Actions" },
					{ value: "background", label: "Background" },
				],
				current_tab: this.$route.path.split("/").length > 4 ? this.$route.path.split("/").pop() : "general"
			}
		},
		async mounted() {
			const char = await this.get_character({ uid: this.userId, id: this.characterId });
			this.character = new Character(char);
			this.loading = false;
		},
		provide() {
			return {
				characterState: this
			}
		},
		computed: {
			computed_values() {
				// return this.get_computed_character(this.userId, this.characterId);
				return {}
			},
			race_modifiers() {
				const modifiers = this.modifierArray(this.character.modifiers).filter(mod => {
					const origin = mod.origin.split(".");
					return origin[0] === 'race';
				});
				return modifiers;
			},
		},
		watch: {
			character: {
				deep: true,
				handler(newVal) {
					// console.log(newVal)
				}
			}
		},
		methods: {
			...mapActions("characters", [
				"get_character",
			]),
			setSize(size) {
				this.width = size.width;
			}
		}
	}
</script>