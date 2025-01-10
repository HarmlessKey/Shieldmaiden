<template>
	<div class="combat-pane" @focus="$emit('focus')">
		<div class="combat-pane__header">
			<div class="combat-pane__header-title">
				<slot name="header-title">
					{{ title }}
				</slot>
			</div>
			<slot name="header-action" />
		</div>
		<q-scroll-area
			:dark="$store.getters.theme === 'dark'"
			:thumb-style="{ width: '5px' }"
			:class="{ shadow: scroll > 0 }"
			@scroll="setScroll"
		>
			<div class="combat-pane__content">
				<slot />
			</div>
		</q-scroll-area>
	</div>
</template>

<script>
export default {
	name: "CombatTrackerPane",
	props: {
		title: {
			type: String,
		},
	},
	data() {
		return {
			scroll: 0,
		};
	},
	methods: {
		setScroll(e) {
			this.scroll = e.verticalPosition;
		},
	},
};
</script>

<style lang="scss" scoped>
.combat-pane {
	background-color: $neutral-6-transparent;
	border-radius: $border-radius;

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: $neutral-8;
		padding: 0 10px;
		min-height: 51px;
		border-top-left-radius: inherit;
		border-top-right-radius: inherit;

		&.shadow {
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.9);
		}

		&-title {
			font-size: 18px;
			font-weight: bold;
		}
	}
	&__content {
		padding: 10px;
	}
	.q-scrollarea {
		position: relative;
		height: calc(100% - 52px);
		max-width: 100%;

		&::v-deep {
			.q-scrollarea__content {
				position: unset;
				overflow: hidden;
			}
		}

		&:before {
			content: "";
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 10;
			pointer-events: none;
		}
		&.shadow:before {
			box-shadow: inset 0px 15px 15px -20px $black;
		}
	}
}

@media only screen and (max-width: 576px) {
	.combat-pane {
		&__header {
			&-title {
				font-size: 15px;
			}
		}
	}
}
</style>
