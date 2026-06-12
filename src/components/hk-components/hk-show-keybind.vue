<template>
	<span v-if="show || userSettings?.general?.keyBinds === undefined">
		<template v-for="(bind, i) in binds">
			<code class="hk-keybind" :key="i">{{ bind }}</code>
			{{ (i+1 &lt; binds.length) ? " + " : "" }}
		</template>
	</span>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	name: "hk-show-keybind",
	props: {
		binds: {
			type: Array,
			required: true,
		},
		show: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		...mapGetters(["userSettings"]),
	},
};
</script>

<style lang="scss" scoped>
.hk-keybind {
	display: inline-block;
	font-size: inherit;
	background-color: $neutral-3;
	padding: 0 5px;
	border-radius: $border-radius-small;
	line-height: 18px;
	white-space: nowrap;
	color: $neutral-1;
}
</style>
