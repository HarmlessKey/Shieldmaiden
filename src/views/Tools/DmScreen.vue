<template>
	<ToolsPage title="DM Screen" bg_img="monster-tool-header.jpg">
		<p>
			With our DM screen you have quick access to you D&D 5e rules, your custom encounter and a soundboard.
		</p>

		<section>
		</section>		
	</ToolsPage>
</template>

<script>
import ToolsPage from "src/components/ToolsPage.vue";

export default {
	name: "ToolsMonsterCreator",
	components: {
		ToolsPage,
	},
	data() {
		return {
			
		};
	},
	methods: {
	},
};
</script>

<style lang="scss" scoped>
.q-img {
	display: block;
	margin: 30px auto;
	width: 100%;

	&::v-deep .q-img__content {
		> div {
			background: none;
		}
	}
	&.res-vul {
		width: 50%;
		max-width: 300px;
	}
	&.action {
		max-width: 600px;
		cursor: pointer;
	}
}
</style>
