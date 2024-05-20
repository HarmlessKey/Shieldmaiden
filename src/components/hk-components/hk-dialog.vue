<template>
	<q-dialog ref="dialog" v-bind="$attrs" v-on="$listeners">
		<hk-card v-bind="$attrs">
			<div slot="header" class="card-header">
				<slot name="header">
					{{ header }}
				</slot>
				<q-btn v-if="closable" round flat v-close-popup icon="close" size="sm" />
			</div>
			<div class="card-body">
				<slot />
			</div>
			<div v-if="$slots['footer']" slot="footer" class="card-footer">
				<slot name="footer" />
			</div>
		</hk-card>
	</q-dialog>
</template>

<script>
export default {
	name: "hk-dialog",
	props: {
		header: {
			type: String,
		},
		closable: {
			type: Boolean,
			default: true,
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
