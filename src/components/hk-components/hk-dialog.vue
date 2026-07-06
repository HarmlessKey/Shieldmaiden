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
			<template v-if="$slots['footer']" v-slot:footer>
				<div class="card-footer">
					<slot name="footer" />
				</div>
			</template>
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
		noPadding: {
			type: Boolean,
			default: false,
		},
		cardClass: {
			type: String,
			default: null,
		}
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