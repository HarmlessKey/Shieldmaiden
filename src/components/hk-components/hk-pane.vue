<template>
	<Pane v-bind="$attrs">
		<q-scroll-area :dark="$store.getters.theme === 'dark'" :thumb-style="{ width: '5px' }">
			<template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
				<slot :name="slot" v-bind="scope" />
			</template>
		</q-scroll-area>
	</Pane>
</template>

<script>
export default {
	name: "hk-pane",
};
</script>

<style lang="scss" scoped>
.q-scrollarea {
	height: 100%;
	position: static;

	&:deep() {
		.q-scrollarea__content {
			width: 100%;
			position: static;
		}
		.q-scrollarea__container {
			position: static;
		}
	}
}
</style>
