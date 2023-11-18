<template>
	<div>
		<h3>Harmless Key Backgrounds</h3>
		<q-img 
			v-for="{ name, value } in background_list" 
			:key="value" 
			:src="require(`src/assets/_img/atmosphere/medium/${value}-medium.jpg`)"
			:alt="name"
			fit="cover"
		/>
	</div>
</template>

<script>
	import { backgrounds } from "src/utils/generalConstants";

	export default {
		name: 'BackgroundsOverview',
		data() {
			return {
				background_list: backgrounds
			}
		}
	};
</script>

<style lang="scss" scoped>
	.q-img {
		width: 100%;
		height: 200px;
	}
</style>