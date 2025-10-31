<template>
	<div>
		<hk-tip
			value="initiative-decimals"
			title="Initiative decimals"
			content="Use decimals when multiple entities have the same initiative to change the order."
		/>

		<ul class="entities">
			<li v-for="(entity, i) in npcs" :key="entity.key">
				<BasicEntity :entity="entity" :size="48" :padding="8">
					<q-checkbox
						slot="name"
						:dark="$store.getters.theme === 'dark'"
						v-model="selected"
						:val="i"
						tabindex="-1"
						class="flex-grow"
					>
						<Name :entity="entity" />
					</q-checkbox>
					<div class="actions">
						<button
							class="btn btn-sm bg-neutral-9"
							tabindex="-1"
							@click="
								setDrawer({ show: true, type: 'combat/entities/Card/index', data: { entity } })
							"
						>
							<i aria-hidden="true" class="fas fa-info"></i>
							<q-tooltip anchor="top middle" self="center middle"> Show info </q-tooltip>
						</button>
					</div>
					<hk-input
						v-model="entity.initiative"
						dense
						type="number"
						min="0"
						max="99"
						name="npcInit"
						class="initiative-input"
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
								<button
									class="pointer"
									tabindex="-1"
									:class="{
										'step-highlight': demo && follow_tutorial && get_step('initiative', 'monsters'),
									}"
								>
									<q-icon size="small" name="fas fa-dice-d20" />
								</button>
							</hk-roll>
						</template>
					</hk-input>
				</BasicEntity>
			</li>
			<TutorialPopover
				v-if="demo"
				tutorial="initiative"
				step="monsters"
				position="right"
				:offset="[10, 0]"
			/>
		</ul>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { dice } from "src/mixins/dice.js";
import { general } from "src/mixins/general.js";
import Name from "../entities/Name.vue";
import TutorialPopover from "src/components/demo/TutorialPopover.vue";
import BasicEntity from "../entities/BasicEntity.vue";

export default {
	name: "SetInitiativeNPC",
	components: {
		Name,
		BasicEntity,
		TutorialPopover,
	},
	mixins: [general, dice],
	props: ["npcs"],
	data() {
		return {
			selectedSetter: undefined,
			selectAll: [],
		};
	},
	computed: {
		...mapGetters(["encounterId", "broadcast", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		share() {
			return (this.broadcast.shares && this.broadcast.shares.includes("initiative_rolls")) || false;
		},
		selected: {
			get() {
				return this.selectedSetter ? this.selectedSetter : [];
			},
			set(newVal) {
				this.$emit("select", newVal.length);
				this.selectedSetter = newVal;
			},
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
::v-deep {
	.q-checkbox {
		min-width: 0;
		margin-right: 5px;

		&__label {
			min-width: 0;
		}
	}
}
.initiative-input {
	min-width: 90px;
}
.advantage .btn:hover {
	background-color: $green;
}
.disadvantage .btn:hover {
	background-color: $red;
}
</style>
