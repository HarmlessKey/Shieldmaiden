<template>
	<div>
		<hk-card>
			<div slot="header" class="card-header d-flex justify-content-between">
				Spell actions
				<a class="btn btn-sm bg-neutral-5" @click="add_action()">
					<i aria-hidden="true" class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Add</span>
					<q-tooltip anchor="top middle" self="center middle"> Add action </q-tooltip>
				</a>
			</div>
			<div class="card-body">
				<p>
					Spell actions are the parts of a spell that can be rolled. By adding spell actions to your
					spell, it can be used during encounters to quickly apply damage or healing.
				</p>
				<ValidationProvider
					rules="between:1,25"
					name="Projectiles"
					v-slot="{ errors, invalid, validated }"
				>
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Projectiles"
						v-model="spell.projectiles"
						autocomplete="off"
						type="number"
						class="mb-2"
						:error="invalid && validated"
						:error-message="errors[0]"
						@keyup="$forceUpdate()"
						@input="
							(value) => $set(spell, 'projectiles', value != undefined ? parseInt(value) : value)
						"
					>
						<hk-popover slot="append" header="Projectiles">
							<i class="fas fa-info-circle" aria-hidden="true" />
							<template #content>
								Some spells, like Magic Missiles (phb 257) have multiple projectiles that can be
								fired to different targets. For each projectile, every spell action is rolled.
							</template>
						</hk-popover>
						<button
							v-if="spell.projectiles && spell.scaling && spell.scaling != 'none'"
							slot="after"
							@click.prevent="scaling_dialog = true"
							class="btn bg-neutral-5"
						>
							<i class="fas fa-chart-line" aria-hidden="true" />
						</button>
					</q-input>
				</ValidationProvider>
				<q-select
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					multiple
					use-input
					use-chips
					label="Options"
					v-model="spell.options"
					:option-disable="
						(opt) => spell.options && spell.options.length > 1 && opt === spell.options[0]
					"
					class="mb-4"
					new-value-mode="add-unique"
				>
					<hk-popover slot="append" header="Action options">
						<i class="fas fa-info-circle" aria-hidden="true" />
						<template #content>
							Options allow you to create slightly different rolls for the actions and choose to use
							this spell for one of the options. Think of versatile weapon attacks where you roll a
							different damage die for 1- or 2-handed attacks.
						</template>
					</hk-popover>
				</q-select>

				<!-- ACTION LIST -->
				<q-list :dark="$store.getters.theme === 'dark'" class="accordion">
					<ValidationObserver
						v-for="(action, action_index) in spell.actions"
						v-slot="{ valid }"
						:key="`action-${action_index}`"
					>
						<q-expansion-item
							:dark="$store.getters.theme === 'dark'"
							switch-toggle-side
							group="actions"
							name="actions"
							enter-active-class="animated animate__fadeIn"
							leave-active-class="animated animate__fadeOut"
						>
							<template v-slot:header>
								<q-item-section avatar v-if="!valid">
									<q-icon name="error" color="red" />
									<q-tooltip anchor="top middle" self="center middle">
										Validation errors
									</q-tooltip>
								</q-item-section>
								<q-item-section>{{ action.name }}</q-item-section>
								<q-item-section avatar>
									<a @click.stop="remove_action(action_index)" class="remove">
										<i aria-hidden="true" class="fas fa-trash-alt red" />
										<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
									</a>
								</q-item-section>
							</template>
							<div class="accordion-body">
								<div class="row q-col-gutter-md">
									<!-- ACTION TYPE -->
									<div class="col-12 col-md-12">
										<ValidationProvider
											rules="required|max:100"
											name="Attack type"
											v-slot="{ errors, invalid, validated }"
										>
											<q-input
												:dark="$store.getters.theme === 'dark'"
												filled
												square
												label="Action name"
												v-model="action.name"
												autocomplete="off"
												class="mb-2"
												@keyup="$forceUpdate()"
												:error="invalid && validated"
												:error-message="errors[0]"
											/>
										</ValidationProvider>
									</div>
									<!-- <div class="col-12 col-md-4">
										<q-checkbox
											:dark="$store.getters.theme === 'dark'"
											v-model="action.optional"
											size="xl"
											:false-value="null"
											indeterminate-value="something-else"
											@input="$forceUpdate()"
										>
											<span class="mr-2">Optional</span>
											<hk-popover
												header="Optional action"
												content="When rolling this ability you can choose to roll one of the optional actions provided. Non-optional actions are always rolled."
											>
												<i class="fas fa-info-circle" aria-hidden="true" />
											</hk-popover>
										</q-checkbox>
									</div> -->
								</div>
								<div class="row q-col-gutter-md">
									<!-- ACTION TYPE -->
									<div class="col-12 col-md-6">
										<ValidationProvider
											rules="required"
											name="Attack type"
											v-slot="{ errors, invalid, validated }"
										>
											<q-select
												:dark="$store.getters.theme === 'dark'"
												filled
												square
												map-options
												emit-value
												label="Attack type"
												:options="Object.values(attack_types)"
												v-model="action.type"
												class="mb-2"
												@input="$forceUpdate()"
												:error="invalid && validated"
												:error-message="errors[0]"
											/>
										</ValidationProvider>
									</div>

									<!-- SAVE -->
									<div class="col-12 col-md-6">
										<q-select
											:dark="$store.getters.theme === 'dark'"
											filled
											square
											map-options
											emit-value
											label="Save ability"
											:options="abilities"
											v-model="action.save_ability"
											:disable="action.type !== 'save'"
											class="mb-2"
											@input="$forceUpdate()"
										/>
									</div>
								</div>

								<!-- ROLLS -->
								<div class="d-flex justify-content-between mb-2">
									<span><i aria-hidden="true" class="fas fa-dice-d20" /> Rolls</span>
									<a class="btn btn-sm bg-neutral-5" @click="newRoll(action, action_index)">
										<i aria-hidden="true" class="fas fa-plus green"></i>
										<span class="d-none d-md-inline ml-1">Add</span>
										<q-tooltip anchor="top middle" self="center middle">Add roll</q-tooltip>
									</a>
								</div>
								<hk-action-rolls-table
									v-if="action.rolls"
									:rolls="action.rolls"
									:scaling="spell.scaling"
									:level="spell.level"
									:type="action.type"
									@edit="editRoll($event, action, action_index)"
									@delete="deleteRoll($event, action_index)"
								/>
							</div>
						</q-expansion-item>
					</ValidationObserver>
				</q-list>
			</div>
		</hk-card>

		<q-dialog v-model="roll_dialog">
			<div v-if="roll">
				<ValidationObserver v-slot="{ handleSubmit, valid }">
					<q-form @submit="handleSubmit(saveRoll)">
						<hk-card :header="edit_index !== undefined ? 'Edit roll' : 'New roll'" class="mb-0">
							<div class="card-body">
								<hk-action-roll-form
									v-model="roll"
									:options="spell.options"
									:action_type="action_type"
									:spell="spell"
								/>
							</div>
							<div slot="footer" class="card-footer d-flex justify-content-end">
								<q-btn class="mr-1" v-close-popup no-caps>Cancel</q-btn>
								<q-btn
									color="primary"
									type="submit"
									no-caps
									:disabled="!valid"
									:label="edit_index !== undefined ? 'Save' : 'Add'"
								/>
							</div>
						</hk-card>
					</q-form>
				</ValidationObserver>
			</div>
		</q-dialog>

		<q-dialog v-model="scaling_dialog">
			<div>
				<ValidationObserver>
					<q-form>
						<hk-card header="Projectile scaling" class="mb-0">
							<div class="card-body">
								<hk-action-roll-scaling
									v-model="spell.projectile_scaling"
									type="projectile"
									:spell="spell"
									@input="$forceUpdate()"
								/>
							</div>
							<div slot="footer" class="card-footer d-flex justify-content-end">
								<q-btn class="mr-1" v-close-popup no-caps>Close</q-btn>
							</div>
						</hk-card>
					</q-form>
				</ValidationObserver>
			</div>
		</q-dialog>
	</div>
</template>

<script>
import { abilities } from "src/utils/generalConstants";
import { attack_types } from "src/utils/actionConstants";

export default {
	name: "spells-Actions",
	props: {
		value: Object,
	},
	data() {
		return {
			editing: false,
			roll_dialog: false,
			scaling_dialog: false,
			roll: undefined,
			action_type: undefined,
			action_index: undefined,
			edit_index: undefined,
			abilities: abilities,
			attack_types: attack_types,
		};
	},
	computed: {
		spell: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
			},
		},
	},

	methods: {
		add_action() {
			if (this.spell.actions == undefined) {
				this.spell.actions = [];
			}
			this.spell.actions.push({
				type: "spell_attack",
				name: "New action",
			});
			this.$forceUpdate();
		},
		remove_action(index) {
			this.$delete(this.spell.actions, index);
		},
		newRoll(action, action_index) {
			this.edit_index = undefined; // It's new, so no edit index
			this.action_index = action_index;
			this.action_type = action.type;
			this.roll = {}; // Create an empty new roll
			this.roll_dialog = true;
		},
		editRoll(roll, action, action_index) {
			this.edit_index = roll.roll_index;
			this.action_index = action_index;
			this.action_type = action.type;
			this.roll = this.spell.actions[action_index].rolls[roll.roll_index];
			this.roll_dialog = true;
		},
		saveRoll() {
			if (this.edit_index === undefined) {
				const rolls = !this.spell.actions[this.action_index].rolls
					? []
					: this.spell.actions[this.action_index].rolls;
				rolls.push(this.roll);
				this.$set(this.spell.actions[this.action_index], "rolls", rolls);
			} else {
				this.$set(this.spell.actions[this.action_index].rolls, this.edit_index, this.roll);
			}
			this.roll = {};
			this.edit_index = undefined;
			this.action_index = undefined;
			this.roll_dialog = false;
		},
		cancelRoll() {
			this.roll_dialog = false;
			this.edit_index = undefined;
			this.action_index = undefined;
			this.roll = undefined;
		},
		removeRoll(index) {
			this.$delete(this.rolls, index);
		},
	},
};
</script>
