<template>
	<div class="card">
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
			<edit-spell-action 
				v-if="edit_index !== undefined" 
				v-model="spell.actions[edit_index]" 
				:level_scaling="spell.level_scaling"
				:level="spell.level"
				@saved="saved_action()"
			/>
			<template v-else>
				<div v-for="(spell_action, index) in spell.actions" class="d-flex justify-content-between">
					<span>{{spell_action.type}}</span>
					<span @click="edit_action(index)">edit</span>
					<span @click="remove_action(index)">delete</span>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
	import HKtable from '@/components/hk-components/hk-table.vue';
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
				type: "Spell Attack",
				modifiers: [],
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
  }
};
</script>

<style lang="scss" scoped>
</style>
