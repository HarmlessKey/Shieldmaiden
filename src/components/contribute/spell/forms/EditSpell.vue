<template>
	<div class="form">
		<basic-info v-model='spell' :levels='spell_levels' />
		<!-- SPELL ACTIONS -->
		<spell-actions v-model='spell' />
	</div>
</template>

<script>
import basicInfo from '@/components/contribute/spell/forms/basic-info';
import spellActions from '@/components/contribute/spell/forms/spell-actions';
import { spells } from '@/mixins/spells'; 

export default {
	name: 'EditSpell',
	components: {
		basicInfo,
		spellActions,
	},
	mixins: [ spells ],
	props: { spell: Object },
	data() {
		return {
		}
	},
	mounted() {
		// console.log(this.spell_levels)
	}
	

}
</script>

<style>

</style>