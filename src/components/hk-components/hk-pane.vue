<template>
	<Pane v-bind="$attrs">
		<q-scroll-area :dark="$store.getters.theme === 'dark'" :thumb-style="{ width: '5px' }">
			<template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
				<slot :name="slot" v-bind="scope || {}" />
			</template>
		</q-scroll-area>
	</Pane>
</template>

<script>
export default {
	name: "hk-pane",
	// $listeners is gone in Vue 3: listeners live in $attrs, which is bound
	// explicitly below, so automatic fallthrough has to be off or every
	// attribute and listener would be applied to Pane twice.
	inheritAttrs: false,
};
</script>
