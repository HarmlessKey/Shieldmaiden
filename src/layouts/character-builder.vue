<template>
	<div v-if="!loading">
		<build-type-select 
			v-if="character.build === 'new'"
			:user-id="userId"
			:character-id="characterId"
			@save="save"
		/>
	
		<div 
			v-else-if="character.build === 'advanced'"
			class="row q-col-gutter-md content__edit"
		>
			<div class="col-12" :class="{ 'col-md-9': width > 978 }">
				<div class="tabs">
					<q-tabs
						dark
						inline-label
						align="left"
						no-caps
					>
						<q-route-tab
							v-for="({value, label, icon, disabled}, i) in tabs" 
							exact replace
							:icon="icon"
							:label="label"
							:name="value"
							:disabled="disabled"
							:to="`/content/characters-alpha/${characterId}/${value}`"
							:key="`tab-${i}`"
						/>
					</q-tabs>
					<router-view
						:character-id="characterId"
						:user-id="userId"
						@save="save"
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
	import BuildTypeSelect from "src/components/characters/build-type-select";
	import Computed from "src/components/characters/computed";
	import { Character, ComputedCharacter } from "src/classes/character";

	export default {
		name: "CharacterBuilderLayout",
		components: {
			BuildTypeSelect,
			Computed
		},
		data() {
			return {
				userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
				characterId: this.$route.params.id,
				character_copy: undefined,
				computed_character: {},
				loading: true,
				character: {},
				width: 0,
				tabs: [
					{ value: "info", label: "", icon: "fas fa-info-circle" },
					{ value: "general", label: "General" },
					{ value: "race", label: "Race" },
					{ value: "class", label: "Class" },
					{ value: "abilities", label: "Abilities" },
					{ value: "equipment", label: "Equipment", disabled: true },
					{ value: "actions", label: "Actions", disabled: true },
					{ value: "background", label: "Background", disabled: true },
				],
			}
		},
		async created() {
			const char = await this.get_character({ uid: this.userId, id: this.characterId });
			this.character = new Character(char);
			this.character_copy = JSON.parse(JSON.stringify(this.character));
			this.computed_character = new ComputedCharacter(this.character);

			this.loading = false;
		},
		provide() {
			return {
				characterState: this,
			}
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
				"update_character"
			]),
			setSize(size) {
				this.width = size.width;
			},
			async save() {
				console.log("saving: ", this.character);

				this.computed_character = new ComputedCharacter({...this.character});
				await this.update_character({
					uid: this.userId,
					id: this.characterId,
					character: this.character,
					computed_character: this.computed_character
				});
				this.character_copy = JSON.parse(JSON.stringify(this.character));
			}
		},
		beforeRouteUpdate(to, from, next) {
			// Reset unsaved changes when the route is updated
			if(JSON.stringify(this.character) !== JSON.stringify(this.character_copy)) {
				this.character = new Character(this.character_copy);
			}
			next();
		}
	}
</script>