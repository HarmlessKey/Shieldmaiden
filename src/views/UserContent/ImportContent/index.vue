<template>
	<div v-if="tier.price !== 'Free'">
		<hk-card header="Import content">
			<div slot="header" class="card-header">
				<div><hk-icon icon="fas fa-file-upload" class="mr-1" /> Import content</div>
			</div>
			<div class="card-body">
				<div class="row q-col-gutter-md">
					<div class="col-12 col-sm-6 col-md-4">
						<hk-card header="Shieldmaiden">
							<div class="card-body">
								<p>Import a Shieldmaiden export</p>
							</div>
							<div slot="footer">
								<router-link to="/content/import/shieldmaiden-import" class="btn btn-block"
									>Start import</router-link
								>
							</div>
						</hk-card>
					</div>
					<div class="col-12 col-sm-6 col-md-4">
						<hk-card header="Generate NPCs">
							<div class="card-body">
								<p>Generate Shieldmaiden NPCs from an image or text prompt.</p>
							</div>
							<div slot="footer">
								<router-link to="/content/import/generate-npcs" class="btn btn-block"
									>Start generate</router-link
								>
							</div>
						</hk-card>
					</div>
				</div>
			</div>
		</hk-card>
	</div>
	<hk-card v-else header="Import content">
		<div class="card-body d-flex flex-col justify-center">
			<h2>With a subscription you can import Shieldmaiden content created by others.</h2>
			<p>
				Content creators can export their entire one shots or campaigns from Shieldmaiden and you
				will be able to import them including all encounters and monsters.
			</p>
			<h2>Generate NPCs</h2>
			<p>
				You can't spell Shieldmaiden without AI, therefore, you can generate NPCs with an image or
				text prompt, that you can use directly in Shieldmaiden.
			</p>
			<router-link to="/patreon" class="btn btn-lg mt-2">Get a subscription</router-link>
		</div>
	</hk-card>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	name: "import-content",
	computed: {
		...mapGetters(["tier"]),
	},
};
</script>

<style lang="scss" scoped>
h2 {
	margin-bottom: 10px;
}
.hk-card {
	height: 100%;
}
</style>
