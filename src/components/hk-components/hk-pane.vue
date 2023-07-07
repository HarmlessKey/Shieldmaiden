<template>
	<Pane v-bind="$attrs" v-on="$listeners">
		<q-scroll-area :dark="$store.getters.theme === 'dark'" :thumb-style="{ width: '5px' }">
			<slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot" />
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
	position: relative;
}
</style>
