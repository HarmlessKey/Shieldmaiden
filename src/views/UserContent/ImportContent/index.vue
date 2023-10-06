<template>
	<div class="d-flex justify-center">
		<hk-card header="Harmless Key">
			<div class="card-body">
				<p>Import a Harmless Key export</p>
			</div>
			<div slot="footer">
				<router-link to="/content/import/hk_import" class="btn btn-block">Select</router-link>
			</div>
		</hk-card>
		<hk-card header="Convert Old" class="disabled">
			<div class="card-body">
				<p>Convert your old exports to new format</p>
			</div>
			<div slot="footer">
				<button class="btn btn-block">Select</button>
			</div>
		</hk-card>
		<hk-card header="External Source" class="disabled">
			<div class="card-body">
				<p>Import from an external source</p>
			</div>
			<div slot="footer">
				<button class="btn btn-block">Select</button>
			</div>
		</hk-card>
		<hk-card header="Sync Extension" class="disabled">
			<div class="card-body">
				<p>Import from the HK Content Sync Extension</p>
			</div>
			<div slot="footer">
				<button class="btn btn-block">Select</button>
			</div>
		</hk-card>
	</div>
</template>

<script>
export default {
	name: "manage-content",

	data() {
		return {};
	},
	computed: {},
};
</script>

<style lang="scss" scoped>
.hk-card {
	max-width: 200px;
	margin: 10px;
	user-select: none;
}
</style>
