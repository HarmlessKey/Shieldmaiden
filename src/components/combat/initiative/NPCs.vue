<template>
	<div>
		<hk-tip
			value="initiative-decimals"
			title="Initiative decimals"
			content="Use decimals when multiple entities have the same initiative to change the order."
		/>

		<ul class="entities hasImg">
			<li v-for="(entity, i) in npcs" :key="entity.key">
				<TargetAvatar :entity="entity" class="img pointer" :icons="false" />
				<div class="truncate">
					<q-checkbox
						:dark="$store.getters.theme === 'dark'"
						v-model="selected"
						:val="i"
						:label="entity.name.capitalizeEach()"
						tabindex="-1"
					/>
				</div>

				<div class="actions">
					<a
						class="btn btn-sm bg-neutral-5"
						@click="setDrawer({ show: true, type: 'combat/ViewEntity', data: entity })"
					>
						<i aria-hidden="true" class="fas fa-info"></i>
						<q-tooltip anchor="top middle" self="center middle"> Show info </q-tooltip>
					</a>
					<hk-input
						v-model="entity.initiative"
						dense
						type="number"
						class="ml-3"
						min="0"
						max="99"
						name="npcInit"
						@input="set_initiative({ key: entity.key, initiative: entity.initiative })"
						placeholder="0"
						@keydown.enter="$refs?.[i]?.[0]?.$el?.click()"
					>
						<template v-slot:append>
							<hk-roll
								:ref="i"
								:tooltip="`1d20 + ${calcMod(entity.dexterity)}`"
								@roll="rollMonster($event.e, entity.key, entity, $event.advantage_disadvantage)"
							>
								<a
									:class="{
										'step-highlight': demo && follow_tutorial && get_step('initiative', 'monsters'),
									}"
								>
									<q-icon size="small" name="fas fa-dice-d20" />
								</a>
							</hk-roll>
						</template>
					</hk-input>
				</div>
			</li>
			<TutorialPopover
				v-if="demo"
				tutorial="initiative"
				step="monsters"
				position="right"
				:offset="[10, 0]"
			/>
		</ul>
		<hk-roll class="full-width" @roll="selected.length === 0 ? rollAll($event) : rollGroup($event)">
			<button
				class="btn btn-block full-width roll-all"
				:class="{
					'step-highlight': demo && follow_tutorial && get_step('initiative', 'monsters'),
				}"
			>
				<i aria-hidden="true" class="fas fa-dice-d20" /> Roll
				{{ selected.length === 0 ? "all" : "selected" }}
			</button>
		</hk-roll>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { dice } from "src/mixins/dice.js";
import { general } from "src/mixins/general.js";
import TargetAvatar from "../TargetAvatar.vue";
import TutorialPopover from "src/components/demo/TutorialPopover.vue";

export default {
	name: "SetInitiativeNPC",
	components: {
		TargetAvatar,
		TutorialPopover,
	},
	mixins: [general, dice],
	props: ["npcs"],
	data() {
		return {
			selected: [],
			selectAll: [],
		};
	},
	computed: {
		...mapGetters(["encounterId", "broadcast", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		share() {
			return (this.broadcast.shares && this.broadcast.shares.includes("initiative_rolls")) || false;
		},
	},
	methods: {
		...mapActions(["setDrawer", "set_initiative"]),
		...mapActions("tutorial", ["completeStep"]),
		rollMonster(e, key, entity, advantage_disadvantage) {
			const advantage_object = advantage_disadvantage ? advantage_disadvantage : {};
			let roll = this.rollD(
				e,
				20,
				1,
				this.calcMod(entity.dexterity),
				"Initiative",
				entity.name,
				false,
				advantage_object,
				this.share ? { encounter_id: this.encounterId, entity_key: key } : null
			);
			entity.initiative = roll.total;
			this.setInitiative(key, entity.initiative);
		},
		rollAll(e) {
			for (let i in this.npcs) {
				let key = this.npcs[i].key;
				this.rollMonster(e.e, key, this.npcs[i], e.advantage_disadvantage);
			}
		},
		rollGroup(e) {
			let dex = Infinity;
			let entity;
			for (const npc_indx of this.selected) {
				entity = this.npcs[npc_indx];

				//Find lowest Dex
				if (entity.dexterity < dex) {
					dex = entity.dexterity;
				}
			}
			const advantage_object = e.advantage_disadvantage ? e.advantage_disadvantage : {};
			const roll = this.rollD(
				e.e,
				20,
				1,
				this.calcMod(dex),
				"Group initiative",
				undefined,
				false,
				advantage_object,
				this.share ? { encounter_id: this.encounterId } : null
			).total;

			for (const npc_indx of this.selected) {
				entity = this.npcs[npc_indx];
				entity.initiative = roll;

				this.setInitiative(entity.key, entity.initiative);
			}
			this.selected = [];
		},
		setInitiative(key, initiative) {
			this.set_initiative({ key, initiative });

			// If initiative has been set for all monsters, complete the tutorial step
			if (!this.npcs.find((npc) => !npc.initiative) && this.get_step("initiative", "monsters")) {
				this.completeStep({ tutorial: "initiative" });
			}
		},
	},
};
</script>

<style lang="scss" scoped>
ul.entities {
	margin-top: 0;

	li {
		padding-right: 3px;
		background: $neutral-8;

		.actions {
			align-items: center;
			padding: 0;

			a {
				margin: 0;
				border-radius: $border-radius;
				padding: 0 5px;

				i {
					margin-top: -5px;
				}
			}
		}
	}
}
.advantage .btn:hover {
	background-color: $green;
}
.disadvantage .btn:hover {
	background-color: $red;
}
</style>
