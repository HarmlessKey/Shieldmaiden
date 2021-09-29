<template>
	<div class="tip" v-if="!get_tip(value)">
		<q-icon name="info" size="medium" color="yellow" class="tip__icon" />
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
			return !!this.$slots.content || !!this.$scopedSlots.content || !!this.content;
		},
		hasTitle() {
			return !!this.$slots.title || !!this.$scopedSlots.title || !!this.title;
		},
	},
	methods: {
		...mapActions([
			"set_tip"
		]),
		closeTip() {
			this.set_tip(this.value);
			this.$forceUpdate();
		}
	}
}
</script>

<style lang="scss" scoped>
	.tip {
		display: flex;
		justify-content: space-between;
		border-left: solid 8px $yellow;
		padding: 5px;
		background-color: rgba(0, 0, 0, .2);
		margin-bottom: 20px;

		&__icon {
			padding-right: 8px;
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
			color: $gray-light;
			line-height: 10px;

			&:hover {
				color: $neutral-1;
			}
		}
	}
</style>