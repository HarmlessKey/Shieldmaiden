<template>
	<hk-card header="Import Shieldmaiden content">
		<ImportUserContent class="card-body" />
	</hk-card>
</template>

<script>
import ImportUserContent from "src/components/userContent/ImportUserContent";

export default {
	name: "import-shieldmaiden-content",
	components: {
		ImportUserContent,
	},
};
</script>
