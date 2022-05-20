<template>
	<div class="form">
		<BasicInfo v-model="editableSpell" />
		<SpellActions v-model="editableSpell" />
	</div>
</template>

<script>
import BasicInfo from 'src/components/contribute/spell/forms/BasicInfo';
import SpellActions from 'src/components/contribute/spell/forms/actions';

export default {
	name: 'EditSpell',
	components: {
		BasicInfo,
		SpellActions,
	},
	props: { spell: Object },
	data() {
		return {
			editableSpell: this.spell
		}
	}
}
</script>