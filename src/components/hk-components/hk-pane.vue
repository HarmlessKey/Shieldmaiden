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

<style lang="scss" scoped>
.q-scrollarea {
	height: 100%;
	position: static;
	// Quasar 1 gave .q-scrollarea `contain: strict`; Quasar 2 only `contain: size`.
	// Layout containment is what makes this static element the containing block for
	// absolutely positioned content (e.g. the campaign Share overlay and its action
	// bar); without it they escape the pane and cover the whole screen.
	contain: strict;

	:deep(.q-scrollarea__content) {
		width: 100%;
		position: static;
	}
	:deep(.q-scrollarea__container) {
		position: static;
	}
}
</style>
