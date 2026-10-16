<template>
	<q-dialog ref="dialog" v-bind="$attrs">
		<hk-card v-bind="$attrs" :class="cardClass">
			<template v-slot:header>
				<div class="card-header">
					<slot name="header">
						{{ header }}
					</slot>
					<q-btn v-if="closable" round flat v-close-popup icon="close" size="sm" />
				</div>
			</template>
			<div :class="{ 'card-body': !noPadding }">
				<slot />
			</div>
			<template v-slot:footer>
				<div v-if="$slots['footer']" class="card-footer">
					<slot name="footer" />
				</div>
			</template>
		</hk-card>
	</q-dialog>
</template>

<script>
export default {
	name: "hk-dialog",
	// $listeners is gone in Vue 3: listeners live in $attrs, which is bound
	// explicitly on the q-dialog, so fallthrough has to be off to avoid applying
	// everything twice.
	inheritAttrs: false,
	props: {
		header: {
			type: String,
		},
		closable: {
			type: Boolean,
			default: true,
		},
		noPadding: {
			type: Boolean,
			default: false,
		},
		cardClass: {
			type: String,
			default: null,
		},
	},
	methods: {
		show() {
			this.$refs.dialog.show();
		},
		hide() {
			this.$refs.dialog.hide();
		},
	},
};
</script>

<style lang="scss" scoped>
.hk-card {
	max-width: 95vw;
	width: 576px;
	margin-top: 100px;
}
</style>
