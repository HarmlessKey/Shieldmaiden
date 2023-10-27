<template>
	<hk-card header="Manage your content">
		<ImportUserContent class="card-body" />
	</hk-card>
</template>

<script>
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
