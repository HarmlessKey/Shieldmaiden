<template>
	<div>
		<hk-card >
			<div slot="header" class="card-header d-flex justify-content-between">
				Spell actions
				<a class="neutral-2 text-capitalize" @click="add_action()">
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Add</span>
					<q-tooltip anchor="top middle" self="center middle">
						Add action
					</q-tooltip>
				</a>
			</div>
			<p>
				Spell actions are the parts of a spell that can be rolled. 
				By adding spell actions to your spell, it can be used during 
				encounters to quickly apply damage or healing.
			</p>
			
			<q-list :dark="$store.getters.theme === 'dark'" square :class="`accordion`">
				<q-expansion-item
					v-for="(action, action_index) in spell.actions" 
					:key="`action-${action_index}`"
					:dark="$store.getters.theme === 'dark'" switch-toggle-side
					group="actions"
				>
					<template v-slot:header>
						<q-item-section>
							{{ action.name }}
						</q-item-section>
						<q-item-section avatar>
							<a @click="remove_action(action_index)" class="remove">
								<i class="fas fa-trash-alt red" />
								<q-tooltip anchor="top middle" self="center middle">
									Remove
								</q-tooltip>
							</a>
						</q-item-section>
					</template>

					<div class="accordion-body">
						<div class="row q-col-gutter-md">
							<!-- ACTION TYPE -->
							<div class="col-12 col-md-3">
								<q-select 
									:dark="$store.getters.theme === 'dark'" filled square
									map-options
									emit-value
									label="Attack type"
									:options="attack_type"
									v-model="action.type"
									class="mb-2"
									:rules="[val => !!val || 'Required']"
									@input="$forceUpdate()"
								/>
							</div>
							<!-- ACTION NAME -->
							<div class="col-12 col-md-3">
								<q-input 
									:dark="$store.getters.theme === 'dark'" filled square
									label="Action name"
									v-model="action.name"
									autocomplete="off"
									class="mb-2"
									title="Action Name"
									:rules="[val => (val && val.length < 100) || 'Too long']"
									@change="$forceUpdate()"
								/>
							</div>
							<!-- SAVE -->
							<div class="col-12 col-md-2">
								<q-select 
									:dark="$store.getters.theme === 'dark'" filled square
									map-options
									emit-value
									label="Save"
									:options="abilities"
									v-model="action.save"
									:disable="action.type !== 'spell save'"
									class="mb-2"
									@input="$forceUpdate()"
								/>
							</div>
							<!-- Free cast -->
							<div class="col-12 col-md-2">
								<q-checkbox 
									size="lg" 
									:dark="$store.getters.theme === 'dark'" 
									v-model="action.free" 
									label="Free" 
									:false-value="null" 
									indeterminate-value="something-else"
									@input="$forceUpdate()"
								>
									<q-tooltip anchor="top middle" self="center middle">
										Doesn't cost a spell slot
									</q-tooltip>
								</q-checkbox>
							</div>
							<!-- Seperate cast -->
							<div class="col-12 col-md-2">
								<q-checkbox 
									size="lg" :dark="$store.getters.theme === 'dark'" 
									v-model="action.seperate" 
									label="Seperate" 
									:false-value="null" 
									indeterminate-value="something-else"
									@input="$forceUpdate()"
								>
									<q-tooltip anchor="top middle" self="center middle">
										Can be cast seperately
									</q-tooltip>
								</q-checkbox>
							</div>
						</div>
						<!-- ROLLS -->
						<Rolls
							v-model="action.rolls" 
							:level_scaling="spell.level_scaling"
							:level="spell.level"
							:action_type="action.type"
							@input="$forceUpdate()"
						/>
					</div>

				</q-expansion-item>
			</q-list>
		</hk-card>
	</div>
</template>

<script>
import Rolls from './Rolls.vue';
import { abilities } from '@/mixins/abilities.js';

export default {
	name: 'spells-Actions',
	mixins: [abilities],
	props: {
		value: Object,
	},
	components: {
		Rolls
	},
	data() {
		return {
			editing: false,
			edit_index: undefined,
			attack_type: [
				{ label: "Melee Weapon", value: "melee_weapon" },
				{ label: "Ranged Weapon", value: "ranged_weapon" },
				{ label: "Spell Attack", value: "spell_attack" },
				{ label: "Spell Save", value: "save" },
				{ label: "Healing", value: "healing" },
				{ label: "Damage", value: "damage" },
				{ label: "Other", value: "other" },
			],
		};
	},
	computed: {
		spell: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
			}
		}
	},
	
	methods: {
		add_action() {
			if (this.spell.actions == undefined) {
				this.spell.actions = [];
			}
			this.spell.actions.push({
				type: "spell_attack",
				name: "New action"
			});
			this.$forceUpdate();
		},
		remove_action(index) {
			this.$delete(this.spell.actions, index)
			// Update points to actions in modifiers
			this.$forceUpdate()
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
