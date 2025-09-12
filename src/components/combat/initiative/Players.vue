<template>
	<div>
		<ul v-if="entities" class="entities hasImg">
			<li v-for="(entity, index) in players" :key="entity.key">
				<Avatar :entity="entity" class="img" :icons="false" />
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
					<hk-input
						dense
						type="number"
						class="ml-2 player-initiative"
						v-model="entity.initiative"
						min="0"
						max="99"
						name="playerInit"
						placeholder="0"
						:autofocus="index === 0"
						:class="{
							'step-highlight': demo && follow_tutorial && get_step('initiative', 'players'),
						}"
						@input="setInitiative(entity.key, entity.initiative)"
						@focus="$event.target.select()"
					/>
				</div>
			</li>
			<TutorialPopover
				v-if="demo"
				tutorial="initiative"
				step="players"
				position="right"
				:offset="[10, 0]"
			/>
		</ul>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Avatar from "../entities/Avatar.vue";
import TutorialPopover from "src/components/demo/TutorialPopover.vue";

export default {
	name: "SetInitiativePlayer",
	components: {
		Avatar,
		TutorialPopover,
	},
	props: ["players"],
	data() {
		return {
			completed: false,
		};
	},
	computed: {
		...mapGetters(["campaignId", "encounterId", "entities", "path", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
	},
	methods: {
		...mapActions(["setDrawer", "set_initiative"]),
		...mapActions("tutorial", ["completeStep"]),
		setInitiative(key, initiative) {
			this.set_initiative({ key, initiative });

			// If initiative has been set for all players, complete the tutorial step
			if (
				!this.completed &&
				!this.players.find((player) => !player.initiative) &&
				this.get_step("initiative", "players")
			) {
				this.completed = true;
				setTimeout(() => {
					this.completeStep({ tutorial: "initiative" });
				}, 500);
			}
		},
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
