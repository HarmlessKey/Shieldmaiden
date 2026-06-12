<template>
	<div>
		<ul v-if="entities" class="entities">
			<li v-for="(entity, index) in players" :key="entity.key">
				<BasicEntity :entity="entity" :size="48" :padding="8">
					<div class="hit-points">
						{{ entity.curHp }} / {{ entity.maxHp }}
						<span v-if="entity.tempHp"> + {{ entity.tempHp }}</span>
					</div>
					<button
						class="btn btn-sm bg-neutral-9"
						tabindex="-1"
						@click="
							setDrawer({ show: true, type: 'drawers/encounter/EditEntity', data: [entity.key] })
						"
					>
						<i aria-hidden="true" class="fas fa-pencil" />
					</button>
					<hk-input
						dense
						type="number"
						class="player-initiative"
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
				</BasicEntity>
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
import TutorialPopover from "src/components/demo/TutorialPopover.vue";
import BasicEntity from "../entities/BasicEntity.vue";

export default {
	name: "SetInitiativePlayer",
	components: {
		BasicEntity,
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
.hit-points {
	white-space: nowrap;
	margin: 0 5px;
}
.player-initiative {
	min-width: 60px;

	::v-deep {
		.q-field__control input {
			padding: 0;
			text-align: center;
		}
	}
}
</style>
