<template>
	<div>
		<ul v-if="entities" class="entities hasImg">
			<li v-for="(entity, index) in players" :key="entity.key">
				<TargetAvatar :entity="entity" class="img" :icons="false" />
				<div class="truncate">
					{{ entity.name }}
				</div>
				<div class="actions">
					<div>
						{{ entity.curHp }} / {{ entity.maxHp }}
						<span v-if="entity.tempHp"> + {{ entity.tempHp }}</span>
					</div>
					<a
						class="btn btn-sm bg-neutral-5"
						@click="
							setDrawer({ show: true, type: 'drawers/encounter/EditEntity', data: [entity.key] })
						"
					>
						<i aria-hidden="true" class="fas fa-pencil"></i>
					</a>
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						dense
						type="number"
						class="ml-2 player-initiative"
						v-model="entity.initiative"
						min="0"
						max="99"
						name="playerInit"
						placeholder="0"
						:autofocus="index === 0"
						@focus="$event.target.select()"
						@input="set_initiative({ key: entity.key, initiative: entity.initiative })"
					/>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import TargetAvatar from "../TargetAvatar.vue";

export default {
	name: "SetInitiativePlayer",
	props: ["players"],
	components: {
		TargetAvatar,
	},
	computed: {
		...mapGetters(["campaignId", "encounterId", "entities", "path"]),
	},
	methods: {
		...mapActions(["setDrawer", "set_initiative"]),
	},
};
</script>

<style lang="scss" scoped>
ul.entities {
	margin: 0;
	li {
		padding-right: 3px;
		background: $neutral-8;

		.actions {
			align-items: center;
			padding: 0;
		}
	}
}
</style>
