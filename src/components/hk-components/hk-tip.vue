<template>
	<div class="tip" v-if="!get_tip(value)">
		<q-icon name="info" size="medium" class="tip__icon" />
		<div class="tip__middle">
			<div class="tip__title" v-if="hasTitle">
				<slot name="title">
					{{ title }}
				</slot>
			</div>
			<div class="tip__content" v-if="hasContent">
				<slot name="content">
					{{ content }}
				</slot>
			</div>
		</div>
		<a @click="closeTip" class="tip__close">
			<q-icon name="close" size="medium" />
		</a>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: 'hk-tip',
	props: {
		value: {
			type: String,
			required: true
		},
		title: {
			type: String,
			default: undefined
		},
		content: {
			type: String,
			default: undefined
		}
	},
	computed: {
		...mapGetters([
			"get_tip"
		]),
		hasContent() {
			return !!this.$slots.content || !!this.content;
		},
		hasTitle() {
			return !!this.$slots.title || !!this.title;
		},
	},
	methods: {
		...mapActions([
			"set_tip"
		]),
		closeTip() {
			this.set_tip(this.value);
			// this.$forceUpdate(); // Removed for Vue 3 - no longer needed with Proxy reactivity
		}
	}
}
</script>

<style lang="scss" scoped>
	.tip {
		display: flex;
		justify-content: space-between;
    border:solid 1px $yellow;
		border-left-width: 8px;
		padding: 5px;
		background-color: rgba(0, 0, 0, .2);
		margin-bottom: 20px;

		&__icon {
			padding-right: 8px;
			color: $yellow;
		}
		&__middle {
			display: flex;
			flex-wrap: wrap;
			flex: 1;
		}
		&__title {
			font-weight: bold;
		}
		&__close {
			padding-left: 8px;
			color: $neutral-3;
			line-height: 10px;

			&:hover {
				color: $neutral-1;
			}
		}
	}

	[data-theme="light"] .tip {
		border-color: $yellow-light;

		&__icon {
			color: $neutral-2;
		}
		.green {
			color: $green-light !important;
		}
	}
</style>
