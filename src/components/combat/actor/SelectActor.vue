<template>
	<div class="select-actor">
		<div
			class="select-actor__initiative"
			:style="{
				color: actor.color_label ? actor.color_label : ``,
				backgroundColor: actor.color_label ? actor.color_label : ``,
			}"
		>
			<div class="select-actor__initiative-value truncate">
				{{ actor.initiative }}
			</div>
		</div>
		<Avatar :entity="actor" :key="actor.key" />
		<div class="d-flex flex-col justify-content-center items-center">
			<button v-if="outOfTurn" @click.stop="set_actor(undefined)">
				<hk-icon icon="fas fa-undo-alt" class="orange" />
				<q-tooltip anchor="top middle" self="bottom middle" :offset="[0, -5]">
					Out of Turn
				</q-tooltip>
			</button>
			<hk-icon icon="fas fa-chevron-down" :class="{ open: show_menu }" />
		</div>
		<q-popup-proxy
			:dark="$store.getters.theme === 'dark'"
			v-model="show_menu"
			content-class="select-actor__select"
			anchor="bottom left"
			self="top left"
			transition-show="jump-down"
			transition-hide="jump-up"
			:breakpoint="576"
			:offset="[0, 10]"
		>
			<q-list>
				<q-item>
					<q-item-section>
						<strong>Select Actor</strong>
					</q-item-section>
				</q-item>
				<q-separator />
				<q-item
					v-for="entity in active"
					:key="entity.key"
					clickable
					v-close-popup
					@click="setActor(entity)"
				>
					<q-item-section class="list-item">
						<BasicEntity :entity="entity" />
					</q-item-section>
				</q-item>
			</q-list>
		</q-popup-proxy>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Avatar from "../entities/Avatar.vue";
import BasicEntity from "../entities/BasicEntity.vue";

export default {
	name: "SelectActor",
	components: {
		Avatar,
		BasicEntity,
	},
	mixins: [],
	props: {
		actor: {
			type: Object,
		},
		_active: {
			type: Array,
			required: true,
		},
		outOfTurn: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			show_menu: false,
		};
	},
	computed: {
		...mapGetters([]),
		active() {
			const entities = this._active.filter((entity) => entity.key !== this.actor.key);
			const environment = {
				key: "environment",
				name: "Environment",
				entityType: "environment",
			};
			return [environment, ...entities];
		},
	},
	methods: {
		...mapActions(["set_actor"]),
		setActor(entity) {
			this.set_actor(entity);
			this.show_menu = false;
		},
	},
};
</script>

<style lang="scss" scoped>
.select-actor {
	position: relative;
	display: flex;
	align-items: center;
	font-size: 22px;
	color: $neutral-2;
	cursor: pointer;

	i {
		transition: all 0.3s linear;
	}
	.open {
		transform: rotate(-180deg);
	}

	&__menu {
		display: flex;
		flex-direction: column;
		border-top-left-radius: $border-radius;
		border-bottom-left-radius: $border-radius;
		background-color: $neutral-11;
		overflow: hidden;
		justify-content: center;

		button {
			padding: 4px 8px 4px 5px;
			text-align: center;
			font-size: 15px;
			flex-grow: 1;

			&:hover {
				background-color: $neutral-7;
			}
		}
	}
	&__initiative {
		border-top-left-radius: 9999px;
		border-bottom-left-radius: 9999px;
		color: $neutral-9;
		background-color: $neutral-9;
		padding: 0 7px 0 9px;
		line-height: 30px;
		min-width: 0;
		width: 18px;
		box-sizing: content-box;
		text-align: center;

		&-value {
			font-size: 15px;
			font-weight: bold;
			filter: invert(1) grayscale(1) brightness(1.3) contrast(9000);
			mix-blend-mode: luminosity;
			opacity: 0.95;
			margin-top: -1px;
		}
	}
	.target-avatar {
		width: 60px;
		height: 60px;
		font-size: 44px;
		border-radius: $border-radius;
		margin-right: 10px;
	}
	.return {
		position: absolute;
		left: -10px;
		top: -12px;
		font-size: 12px;
		background-color: $neutral-5;
		color: $neutral-1;
		border-radius: 9999px;
		text-align: center;
		line-height: 23px;
		width: 25px;
		height: 25px;
		padding-right: 2px;

		&:hover {
			background-color: $neutral-4;
		}
	}
}
.list-item {
	overflow: hidden;
	padding-left: 8px;
	margin-left: -8px;
}
</style>

<style lang="scss">
.select-actor__select {
	width: 100%;
	max-width: 350px;
}
</style>
