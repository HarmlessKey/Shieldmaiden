<template>
	<div class="form">
		<BasicInfo v-model="editableSpell" />
		<SpellActions v-model="editableSpell" />
	</div>
</template>

<script>
import BasicInfo from "src/components/spells/BasicInfo";
import SpellActions from "src/components/spells/actions";

export default {
	name: "EditSpell",
	components: {
		BasicInfo,
		SpellActions,
	},
	props: { spell: Object },
	data() {
		return {
			editableSpell: this.spell,
		};
	},
};
</script>
