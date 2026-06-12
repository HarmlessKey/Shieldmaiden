<template>
	<div>
		<h3>
			Link item to <b>{{ data.item.public_name }}</b>
		</h3>
		<CopyContent @copy="linkItem" type="item" return-id button="link" />
	</div>
</template>

<script>
import { mapActions } from "vuex";
import CopyContent from "src/components/CopyContent";

export default {
	name: "LinkItemEncounter",
	props: ["data"],
	components: {
		CopyContent,
	},
	data() {
		return {
			userId: this.$store.getters.user.uid,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
		};
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("encounters", ["add_encounter_item_link"]),
		async linkItem({ id, resource }) {
			const parent_item = this.data.key;
			const item = {
				key: id,
				custom: resource === "custom" ? true : null,
			};

			await this.add_encounter_item_link({
				campaignId: this.campaignId,
				encounterId: this.encounterId,
				parent_item,
				item,
			});
			this.setDrawer(false);
		},
	},
};
</script>
