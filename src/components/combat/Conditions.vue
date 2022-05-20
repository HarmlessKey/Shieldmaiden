<template>
	<div class="conditions" v-if="entity.conditions && Object.keys(entity.conditions).length > 0">
		<template v-for="(condition, key) in entity.conditions">
			<div :key="key" 
				@click="setSlide({
					show: true, 
					type: 'slides/encounter/Condition',
					data: {
						condition: key,
						entity: entity
					}})" 
					v-if="conditions[key]">
					<span class="n" v-if="key == 'exhaustion'">
						{{ entity.conditions[key] }}
					</span>
					<i aria-hidden="true" :class="`hki-${key}`" class="icon" />
					<q-tooltip anchor="top middle" self="center middle">
						{{ key.capitalize() }}
					</q-tooltip>
			</div>
		</template>
	</div>
</template>

<script>
	import { mapActions } from "vuex";
	import { db } from "src/firebase";

	export default {
		name: "Conditions",
		props: ["entity"],
		firebase() {
			return {
				conditions: {
					source: db.ref("conditions"),
					asObject: true,
				}
			}
		},
		methods: {
			...mapActions(["setSlide"])
		}
	}
</script>

<style lang="scss" scoped>
.conditions {
	margin-top: 8px;
	display: grid;
	grid-template-columns: repeat(auto-fill, 30px);
	grid-auto-rows: 30px;
	grid-gap: 1px;
	
	div {
		position: relative;
	}
	.icon {
		display: block;
		font-size: 16px;
		width: 30px;
		height: 30px;
		line-height: 26px;
		text-align: center;
		color: $neutral-2;
		background-color: $neutral-8;
		padding: 2px;
		cursor: pointer;
	}
	.n {
		position: absolute;
		color: $neutral-1;
		top: 0;
		left: 2px;
	}
}
</style>