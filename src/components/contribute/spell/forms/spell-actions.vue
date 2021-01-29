<template>
	<div>
		<!-- <edit-spell-action 
			v-if="edit_index !== undefined" 
			v-model="spell.actions[edit_index]"
			:action_index="edit_index"
			:level_scaling="spell.level_scaling"
			:level="spell.level"
			@spellUpdate="spellUpdate()"
			@saved="saved_action()"
			@validation="setValidation"
		/> -->
		<hk-card >
			<div slot="header" class="card-header d-flex justify-content-between">
				Spell actions
				<a class="gray-hover text-capitalize" @click="add_action()">
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Add</span>
					<q-tooltip anchor="top middle" self="center middle">
						Add action
					</q-tooltip>
				</a>
			</div>
			<p>Spell actions are the parts of a spell that can be rolled. By adding spell actions to your spell, it can be used during encounters to quickly apply damage or healing and to set conditions and reminders.</p>
			
			<q-list dark square :class="`accordion`">
				<q-expansion-item
					v-for="(action, action_index) in spell.actions" 
					:key="`action-${action_index}`"
					dark switch-toggle-side
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
									dark filled square
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
									dark filled square
									label="Action name"
									v-model="action.name"
									autocomplete="off"
									name="name"
									class="mb-2"
									title="Action Name"
									v-validate="'max:100'"
									data-vv-as="Action Name"
									:rules="[val => (val && val.length < 100) || 'Too long']"
									@change="$forceUpdate()"
								/>
							</div>
							<!-- SAVE -->
							<div class="col-12 col-md-2">
								<q-select 
									dark filled square
									map-options
									emit-value
									label="Save"
									:options="abilities"
									v-model="action.save"
									:disable="action.type !== 'spell save'"
									name="save"
									class="mb-2"
									data-vv-as="Save"
									@input="$forceUpdate()"
								/>
							</div>
							<!-- Free cast -->
							<div class="col-12 col-md-2">
								<q-checkbox 
									size="lg" 
									dark 
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
									size="lg" dark 
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
					</div>

					<!-- ROLLS -->
					<spell-action-rolls
						v-model="action.rolls" 
						:level_scaling="spell.level_scaling"
						:level="spell.level"
						:action_type="action.type"
					/>
				</q-expansion-item>
			</q-list>
		</hk-card>
	</div>
</template>

<script>
import spellActionRolls from '@/components/contribute/spell/forms/spell-action-rolls.vue';
import { abilities } from '@/mixins/abilities.js';

export default {
	name: 'spell-actions',
	mixins: [abilities],
	props: {
		value: Object,
	},
	components: {
		spellActionRolls
	},
	data() {
		return {
			editing: false,
			edit_index: undefined,
			attack_type: [
				{ label: "Melee Weapon", value: "melee_weapon" },
				{ label: "Ranged Weapon", value: "ranged_weapon" },
				{ label: "Spell Attack", value: "spell_attack" },
				{ label: "Spell Save", value: "spell_save" },
				{ label: "Healing Spell", value: "healing_spell" },
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
				type: "spell attack",
				name: "New action",
				modifiers: [],
				conditions: [],
				notifications: [],
				effects: []
			});
			this.$forceUpdate();
		},
		edit_action(index) {
			this.edit_index = index;
		},
		saved_action() {
			this.edit_index = undefined;
		},
		remove_action(index) {
			this.$delete(this.spell.actions, index)
			// Update points to actions in modifiers
			this.$forceUpdate()
		},
		spellUpdate() {
			this.spell = Object.assign({}, this.spell);
		},
		setValidation(validators) {
			// This component just passes through all validators
			// No form fields that need validation
			this.$emit('validation', validators)
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
