<template>
	<hk-card header="Manage your content">
		<ImportUserContent />
	</hk-card>
</template>

<script>
import { mapGetters } from "vuex";
import ImportUserContent from "src/components/userContent/ImportUserContent";

export default {
	name: "manage-content",
	components: {
		ImportUserContent,
	},
	data() {
		return {};
	},
	computed: {},
};
</script>
