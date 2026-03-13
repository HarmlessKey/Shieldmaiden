<template>
	<div>
		<ViewMonster v-if="data" :data="data" :allow-download="true" />
	</div>
</template>

<script>
import ViewMonster from "src/components/compendium/Monster";

export default {
	name: "ViewNpc",
	components: {
		ViewMonster,
	},
	props: {
		data: {
			type: Object,
			required: true,
		},
	},
};
</script>
