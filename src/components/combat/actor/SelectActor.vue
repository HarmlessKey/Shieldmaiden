<template>
	<div class="select-actor">
		<TargetAvatar :entity="actor" />
		<hk-icon icon="fas fa-chevron-down" />
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import TargetAvatar from "../TargetAvatar.vue";

export default {
	name: "SelectActor",
	components: {
		TargetAvatar,
	},
	mixins: [],
	props: {
		actor: {
			type: Object,
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
	watch: {},
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
