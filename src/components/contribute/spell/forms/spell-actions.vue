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
		<hk-card v-else >
			<div slot="header" class="card-header d-flex justify-content-between">
				<span>Spell Actions</span>
				<a 
				class="gray-hover text-capitalize" 
				@click="add_action()">
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Add</span>
				</a>
			</div>
			<p>Spell actions are the parts of a spell that can be rolled. By adding spell actions to your spell, it can be used during encounters to quickly apply damage or healing and to set conditions and reminders.</p>
			
			<hk-table 
				v-if="spell.actions"
				:columns="columns"
				:items="spell.actions"
			>
				<template slot="type" slot-scope="data">
					{{ data.item.capitalizeEach() }}						
				</template>
				<template slot="free" slot-scope="data">
					<!-- {{ data.item }} -->

					<!-- {{ data.item }} -->
					<i v-if="!data.item" class="far fa-check green"></i>
					<i v-else class="far fa-times red"></i>
					<!-- {{ data.item ? '<i class="far fa-code-check"></i>' : '<i class="far fa-code-times"></i>' }} -->
				</template>
				<template slot="seperate" slot-scope="data">
					<i v-if="data.item" class="far fa-check green"></i>
					<i v-else class="far fa-times red"></i>
				</template>
				<template slot="modifiers" slot-scope="data">
					{{ data.item ? data.item.length : "0" }}
				</template>
				<template slot="conditions" slot-scope="data">
					{{ data.item ? data.item.length : "0" }}
				</template>
				<template slot="notifications" slot-scope="data">
					{{ data.item ? data.item.length : "0" }}
				</template>
				<template slot="effects" slot-scope="data">
					{{ data.item ? data.item.length : "0" }}
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
		</hk-card>
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
				name: {
					label: "Name"
				},
				free: {
					label: '<i class="far fa-book-spells"></i></span>',
					tooltip: "Consumes Spell Slot",
					center: true,
					maxContent: true,
				},
				seperate: {
					label: '<i class="far fa-code-branch"></i>',
					tooltip: "Seperate Spell Action",
					center: true,
					maxContent: true,
				},
				modifiers: {
					label: '<i class="fas fa-dice-d20"></i>',
					tooltip: "Modifier",
					center: true,
					maxContent: true,
				},
				conditions: {
					label: '<i class="fas fa-flame"></i>',
					tooltip: "Conditions",
					center: true,
					maxContent: true,
				},
				notifications: {
					label: '<i class="fas fa-bell"></i>',
					tooltip: "Notification",
					center: true,
					maxContent: true,
				},
				effects: {
					label: '<i class="fas fa-hand-holding-magic"></i>',
					tooltip: "Effects",
					center: true,
					maxContent: true,
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
