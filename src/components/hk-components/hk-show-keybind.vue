<template>
	<span v-if="userSettings?.general?.keyBinds === undefined">
		<template v-for="(bind, i) in binds">
			[{{ bind }}]{{ (i+1 &lt; binds.length) ? " + " : "" }}
		</template>
	</span>
</template>

<script>
	import { mapGetters } from "vuex";

	export default {
		name: 'hk-show-keybind',
		props: {
			binds: {
				type: Array,
				required: true
			}
		},
		computed: {
			...mapGetters(["userSettings"]),
		}
	}
</script>