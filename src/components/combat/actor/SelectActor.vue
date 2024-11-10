<template>
	<div class="select-actor">
		<div class="d-flex">
			<div class="select-actor__menu">
				<button v-if="outOfTurn" @click.stop="set_actor(undefined)">
					<hk-icon icon="fas fa-undo-alt" />
					<q-tooltip anchor="center left" self="center right">Return to current actor</q-tooltip>
				</button>
				<button @click.stop>
					<hk-icon icon="fas fa-list-alt" />
					<q-tooltip anchor="center left" self="center right">Show monster card</q-tooltip>
				</button>
			</div>
			<Avatar :entity="actor" />
		</div>
		<div class="d-flex flex-col justify-content-center">
			<div v-if="outOfTurn" class="orange">
				<hk-icon icon="fas fa-exclamation-circle" />
				<q-tooltip anchor="top middle" self="bottom middle" :offset="[0, -5]">
					Out of Turn
				</q-tooltip>
			</div>
			<hk-icon icon="fas fa-chevron-down" />
		</div>
		<q-popup-proxy
			:dark="$store.getters.theme === 'dark'"
			v-model="show_menu"
			content-class="select-actor__select"
			anchor="bottom left"
			self="top left"
			transition-show="scale"
			transition-hide="scale"
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
					<q-item-section>
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
			return this._active.filter((entity) => entity.key !== this.actor.key);
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
	gap: 10px;
	color: $neutral-2;
	cursor: pointer;

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
	.target-avatar {
		width: 60px;
		height: 60px;
		font-size: 44px;
		border-top-right-radius: $border-radius;
		border-bottom-right-radius: $border-radius;
		background-color: $neutral-8;
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
</style>

<style lang="scss">
.select-actor__select {
	width: 100%;
	max-width: 350px;
}
</style>
