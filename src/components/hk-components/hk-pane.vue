<template>
	<Pane v-bind="$attrs" v-on="$listeners">
		<q-scroll-area :dark="$store.getters.theme === 'dark'" :thumb-style="{ width: '5px' }">
			<template v-for="slot in Object.keys($slots)" v-slot:[slot]>
				<slot :name="slot" />
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

	&::v-deep {
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
