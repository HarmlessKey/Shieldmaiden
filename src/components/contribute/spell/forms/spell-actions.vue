<template>
	<div>
		<edit-spell-action 
			v-if="edit_index !== undefined" 
			v-model="spell.actions[edit_index]"
			:action_index="edit_index"
			:level_scaling="spell.level_scaling"
			:level="spell.level"
			@spellUpdate="spellUpdate()"
			@saved="saved_action()"
			@validation="setValidation"
		/>
		<div v-else class="card">
			<div class="card-header d-flex justify-content-between">
				<span>Spell Actions</span>
				<a 
				class="gray-hover text-capitalize" 
				v-b-tooltip.hover title="Add Action" 
				@click="add_action()">
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Add</span>
				</a>
			</div>
			<div class="card-body">
					<p>Spell actions are the parts of a spell that can be rolled. By adding spell actions to your spell, it can be used during encounters to quickly apply damage or healing and to set conditions and reminders.</p>
				<hk-table 
					v-if="spell.actions"
					:columns="columns"
					:items="spell.actions"
				>
					<template slot="modifiers" slot-scope="data">
						{{ data.item ? data.item.length : "" }}
					</template>
					<template slot="conditions" slot-scope="data">
						{{ data.item ? data.item.length : "" }}
					</template>
					<template slot="notifications" slot-scope="data">
						{{ data.item ? data.item.length : "" }}
					</template>
					<div slot="actions" class="actions" slot-scope="data">
						<a @click="edit_action(data.index)">
							<i class="fas fa-pencil"></i>
						</a>
						<a @click="remove_action(data.index)">
							<i class="fas fa-trash-alt"></i>
						</a>
					</div>
				</hk-table>
			</div>
		</div>
		
	</div>
</template>

<script>
import editSpellAction from '@/components/contribute/spell/forms/edit-spell-action.vue';

export default {

	name: 'spell-actions',
	props: {
		value: Object,
	},
	components: {
		editSpellAction,
	},

	data() {
		return {
			editing: false,
			edit_index: undefined,
			columns: {
				type: {
					label: "Type"
				},
				modifiers: {
					label: '<i class="fas fa-dice-d20"></i>',
					center: true
				},
				conditions: {
					label: '<i class="fas fa-flame"></i>',
					center: true
				},
				notifications: {
					label: '<i class="fas fa-bell"></i>',
					center: true
				},
				actions: {
					label: '<i class="far fa-ellipsis-h"></i>',
					noPadding: true,
					right: true,
					maxContent: true
				}
			}
		};
	},
	computed: {
		spell: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
				return newValue;
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
				modifiers: [],
				conditions: [],
				notifications: [],
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
			for (let i in this.spell.modifiers) {
				let mod = this.spell.modifiers[i]
				if (mod.spell_action == index) {
					mod.spell_action = undefined
				}
				else if (mod.spell_action > index) {
					mod.spell_action -= 1
				}
			}

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
