<template>
	<div class="select-actor">
		<Avatar :entity="actor" />
		<hk-icon icon="fas fa-chevron-down" />
		<q-popup-proxy
			:dark="$store.getters.theme === 'dark'"
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
					v-for="entity in _active"
					:key="entity.key"
					clickable
					v-close-popup
					@click="set_actor(entity)"
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
	},
	data() {
		return {};
	},
	computed: {
		...mapGetters([]),
	},
	methods: {
		...mapActions(["set_actor"]),
	},
};
</script>

<style lang="scss" scoped>
.select-actor {
	display: flex;
	align-items: center;
	font-size: 25px;
	gap: 10px;
	color: $neutral-2;
	cursor: pointer;

	.target-avatar {
		width: 60px;
		height: 60px;
		font-size: 44px;
		border-radius: $border-radius;
		background-color: $neutral-8;
	}
}
</style>

<style lang="scss">
.select-actor__select {
	width: 100%;
	max-width: 350px;
}
</style>
