<template>
	<div v-if="!loading">
		<build-type-select 
			v-if="base_values.build === 'new'"
			:user-id="userId"
			:character-id="characterId"
		/>
	
		<div 
			v-else-if="base_values.build === 'advanced'"
			class="row q-col-gutter-md"
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
	import { character } from "src/classes/character";

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
				base_values: {},
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
			this.base_values = new character(char);
			this.loading = false;
		},
		provide() {
			return {
				characterState: this
			}
		},
		computed: {
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