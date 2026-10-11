<template>
	<div>
		<Spell v-if="data" :data="data" custom :allow-download="true" />
	</div>
</template>

<script>
import Spell from "src/components/compendium/Spell";

export default {
	name: "ViewSpell",
	components: {
		Spell,
	},
	props: {
		data: {
			type: Object,
			required: true,
		},
	},
};
</script>
