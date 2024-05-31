<template>
	<div class="content">
		<EditEncounter>
			<router-link
				:to="campaignId ? `/content/campaigns/${campaignId}` : `/`"
				class="btn btn-sm btn-clear"
			>
				<hk-icon icon="fa fa-arrow-left" class="mr-1" />
				Back
			</router-link>
		</EditEncounter>
	</div>
</template>

<script>
import EditEncounter from "src/components/encounters";
export default {
	name: "EditEncounterView",
	components: {
		EditEncounter,
	},
	data() {
		return {
			campaignId: this.$route.params.campid,
		};
	},
};
</script>
