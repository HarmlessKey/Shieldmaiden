<template>
	<div class="target-item-wrapper">
		<div class="target-item bg-neutral-8" :class="{ hasInitiative: initiative }">
			<!-- INITIATIVE -->
			<span
				class="initiative"
				v-if="initiative"
				@click.stop
				:style="{ color: entity.color_label ? entity.color_label : `` }"
			>
				{{ entity.initiative }}
				<q-popup-proxy
					:dark="$store.getters.theme === 'dark'"
					anchor="bottom middle"
					self="top middle"
					transition-show="scale"
					transition-hide="scale"
					:breakpoint="576"
				>
					<div class="bg-neutral-8 px-2 py-2">
						<div class="mb-1">Edit {{ entity.name.capitalizeEach() }}</div>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							dense
							autofocus
							label="Initiative"
							type="number"
							color="white"
							v-model="editable_entity.initiative"
						/>
						<div class="d-flex justify-content-end mt-2">
							<q-btn flat class="bg-neutral-8 mr-1" no-caps v-close-popup>Cancel</q-btn>
							<q-btn
								color="primary"
								v-close-popup
								no-caps
								@click.stop="
									set_initiative({ key: entity.key, initiative: editable_entity.initiative })
								"
							>
								Save
							</q-btn>
						</div>
					</div>
				</q-popup-proxy>
			</span>

			<!-- AVATAR -->
			<TargetAvatar :entity="entity">
				<q-popup-proxy
					v-if="entity.entityType === 'npc'"
					:dark="$store.getters.theme === 'dark'"
					anchor="bottom middle"
					self="top middle"
					transition-show="scale"
					transition-hide="scale"
					:breakpoint="576"
				>
					<div class="bg-neutral-8 px-2 py-2">
						<div class="mb-1">Edit {{ entity.name.capitalizeEach() }}</div>
						<q-color
							square
							:dark="$store.getters.theme === 'dark'"
							flat
							v-model="editable_entity.color_label"
							:palette="hkColors"
							default-view="palette"
						/>
						<div class="d-flex justify-content-end mt-2">
							<q-btn flat class="bg-neutral-8 mr-1" no-caps v-close-popup>Cancel</q-btn>
							<q-btn
								color="primary"
								v-close-popup
								no-caps
								@click.stop="
									edit_entity_prop({
										key: entity.key,
										entityType: entity.entityType,
										prop: 'color_label',
										value: editable_entity.color_label,
									})
								"
							>
								Save
							</q-btn>
						</div>
					</div>
				</q-popup-proxy>
			</TargetAvatar>

			<!-- ARMOR CLASS -->
			<div class="ac_wrapper" @click.stop>
				<i aria-hidden="true" class="fas fa-shield"></i>
				<span
					v-if="entity.ac_bonus"
					class="ac"
					:class="{
						green: entity.ac_bonus > 0,
						red: entity.ac_bonus < 0,
					}"
				>
					{{ displayStats().ac + entity.ac_bonus }}
				</span>
				<span class="ac" v-else>
					{{ displayStats().ac }}
				</span>
				<q-popup-proxy
					:dark="$store.getters.theme === 'dark'"
					anchor="bottom middle"
					self="top middle"
					transition-show="scale"
					transition-hide="scale"
					:breakpoint="576"
				>
					<div class="bg-neutral-8 px-2 py-2">
						<div class="mb-1">{{ entity.name.capitalizeEach() }}</div>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							dense
							label="Armor class bonus"
							type="number"
							color="white"
							v-model="editable_entity.ac_bonus"
						>
							<q-icon slot="append" size="xs" name="fas fa-shield-check" />
							<q-btn
								slot="after"
								flat
								dense
								color="primary"
								icon="check"
								no-caps
								v-close-popup
								@click.stop="
									edit_entity_prop({
										key: entity.key,
										entityType: entity.entityType,
										prop: 'ac_bonus',
										value: editable_entity.ac_bonus,
									})
								"
							/>
						</q-input>
						<q-input
							class="mt-2"
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							dense
							label="Override armor class"
							type="number"
							color="white"
							v-model="editable_entity.ac"
						>
							<q-icon v-if="entity.transformed" slot="prepend" name="fas fa-paw-claws green" />
							<q-icon slot="append" size="xs" name="fas fa-shield" />
							<q-btn
								slot="after"
								flat
								dense
								no-caps
								color="primary"
								icon="check"
								v-close-popup
								@click.stop="
									edit_entity_prop({
										key: entity.key,
										entityType: entity.entityType,
										prop: 'ac',
										value: editable_entity.ac,
									})
								"
							/>
						</q-input>
						<div class="d-flex justify-content-end mt-2">
							<q-btn flat no-caps class="bg-neutral-8" v-close-popup>Close</q-btn>
						</div>
					</div>
				</q-popup-proxy>
			</div>

			<!-- HEALTH BAR -->
			<q-linear-progress
				size="40px"
				:value="percentage(displayStats().curHp, displayStats().maxHp)"
				:color="hpBarColor((displayStats().curHp / displayStats().maxHp) * 100)"
			>
				<div class="absolute-full health-bar">
					<div class="truncate">
						{{ entity.name.capitalizeEach() }}
					</div>

					<!-- HEALTH -->
					<span class="hp" @click.stop>
						<template v-if="entity.curHp > 0 || entity.entityType === 'npc'">
							<span class="health">
								<hk-animated-integer :value="displayStats().curHp" class="current" />
								<span class="mx-1">/</span>
								<span class="max"
									>{{ displayStats().maxHp }}
									<q-tooltip anchor="top middle" self="center middle">
										Max HP {{ entity.maxHpMod > 0 ? `+ ${entity.maxHpMod}` : `` }}
									</q-tooltip>
								</span>
							</span>
							<span v-if="entity.tempHp" class="temp ml-1">
								+{{ entity.tempHp }}
								<q-tooltip anchor="top middle" self="center middle"> Temp HP </q-tooltip>
							</span>
						</template>
						<template v-else>
							<div v-if="entity.stable">
								<i aria-hidden="true" class="fas fa-fist-raised green"></i> Stable
							</div>
							<div v-if="entity.dead && !entity.stable">
								<i aria-hidden="true" class="fas fa-skull-crossbones red"></i> Dead
							</div>
							<div v-else class="hp d-flex justify-content-end">
								<div v-for="index in 5" :key="index">
									<span v-show="entity.saves[index] == 'succes'" class="save green"
										><i aria-hidden="true" class="fas fa-check"></i
									></span>
									<span v-show="entity.saves[index] == 'fail'" class="save red"
										><i aria-hidden="true" class="fas fa-times"></i
									></span>
									<span v-show="!entity.saves[index]" class="save neutral-2"
										><i aria-hidden="true" class="fas fa-dot-circle"></i
									></span>
								</div>
							</div>
						</template>

						<!-- Quick edit HP -->
						<q-popup-proxy
							:dark="$store.getters.theme === 'dark'"
							anchor="bottom middle"
							self="top middle"
							transition-show="scale"
							transition-hide="scale"
							:breakpoint="576"
						>
							<div class="bg-neutral-8 px-2 py-2">
								<div class="mb-1">{{ entity.name.capitalizeEach() }}</div>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									dense
									class="mb-2"
									label="Temporary hit points"
									type="number"
									color="white"
									v-model="editable_entity.tempHp"
								>
									<q-icon slot="append" size="xs" name="fas fa-stopwatch" />
									<q-btn
										slot="after"
										flat
										dense
										no-caps
										color="primary"
										icon="check"
										v-close-popup
										@click.stop="
											edit_entity_prop({
												key: entity.key,
												entityType: entity.entityType,
												prop: 'tempHp',
												value: editable_entity.tempHp,
											})
										"
									/>
								</q-input>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									dense
									label="Maxium hit point modifier"
									type="number"
									color="white"
									v-model="editable_entity.maxHpMod"
								>
									<q-icon v-if="entity.transformed" slot="prepend" name="fas fa-paw-claws green" />
									<q-icon slot="append" size="xs" name="fas fa-plus" />
									<q-btn
										slot="after"
										flat
										dense
										no-caps
										color="primary"
										icon="check"
										v-close-popup
										@click.stop="
											edit_entity_prop({
												key: entity.key,
												entityType: entity.entityType,
												prop: 'maxHpMod',
												value: editable_entity.maxHpMod,
											})
										"
									/>
								</q-input>
								<hr />
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									dense
									label="Override current hit points"
									type="number"
									color="white"
									class="mb-2"
									v-model="editable_entity.curHp"
								>
									<q-icon v-if="entity.transformed" slot="prepend" name="fas fa-paw-claws green" />
									<q-icon slot="append" size="xs" name="fas fa-heart" />
									<q-btn
										slot="after"
										flat
										dense
										no-caps
										color="primary"
										icon="check"
										v-close-popup
										@click.stop="
											edit_entity_prop({
												key: entity.key,
												entityType: entity.entityType,
												prop: 'curHp',
												value: editable_entity.curHp,
											})
										"
									/>
								</q-input>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									dense
									label="Override maximum hit points"
									type="number"
									color="white"
									v-model="editable_entity.maxHp"
								>
									<q-icon v-if="entity.transformed" slot="prepend" name="fas fa-paw-claws green" />
									<span
										slot="append"
										v-if="displayStats().maxHpMod"
										:class="displayStats().maxHpMod > 0 ? 'green' : 'red'"
									>
										{{
											displayStats().maxHpMod > 0
												? `+${displayStats().maxHpMod}`
												: displayStats().maxHpMod
										}}
										<q-tooltip anchor="top middle" self="center middle"> Modifier </q-tooltip>
									</span>
									<q-btn
										slot="after"
										flat
										dense
										color="primary"
										icon="check"
										v-close-popup
										@click.stop="
											edit_entity_prop({
												key: entity.key,
												entityType: entity.entityType,
												prop: 'maxHp',
												value: editable_entity.maxHp,
											})
										"
									/>
								</q-input>
								<div class="d-flex justify-content-end mt-2">
									<q-btn flat no-caps class="bg-neutral-8" v-close-popup>Close</q-btn>
								</div>
							</div>
						</q-popup-proxy>
					</span>

					<!-- CONDITIONS -->
					<div class="conditions d-flex justify-content-right" v-if="entity.conditions">
						<div
							class="condition bg-red"
							v-for="(condition, key) in entity.conditions"
							:key="key"
							@click.stop="showCondition(key)"
						>
							<q-tooltip anchor="top middle" self="center middle">
								<i aria-hidden="true" :class="`hki-${key}`" />
								{{ key.capitalize() }}
							</q-tooltip>
						</div>
					</div>
				</div>
			</q-linear-progress>
		</div>

		<!-- REMINDERS -->
		<ul v-if="entity.reminders && showReminders" class="target-reminders">
			<template v-for="(reminder, index) in entity.reminders">
				<li v-if="reminder" :key="index" :class="'bg-' + reminder.color">
					<q-tooltip anchor="top middle" self="center middle">
						{{ reminder.title }}
					</q-tooltip>
				</li>
			</template>
		</ul>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import TargetAvatar from "./TargetAvatar.vue";

export default {
	name: "TargetItem",
	components: {
		TargetAvatar,
	},
	props: {
		item: {
			type: String,
			required: true,
		},
		i: {
			type: Number,
		},
		initiative: {
			type: Boolean,
			default: false,
		},
		showReminders: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			user: this.$store.getters.user || {},
			target: "",
			entitySetter: undefined,
			hkColors: ["#88b3ce", "#9ac16a", "#c45e66", "#db815e", "#e2da5f", "#9b7aba"],
		};
	},
	computed: {
		...mapGetters(["entities", "targeted"]),
		entity() {
			return this.entities[this.item];
		},
		/**
		 * Copy of the entity object that can be edited with quick edits
		 */
		editable_entity: {
			get() {
				let entity = { ...this.entity };

				// Edit different properties for transformed entities
				if (entity.transformed) {
					entity.maxHp = entity.transformedMaxHp;
					entity.curHp = entity.transformedCurHp;
					entity.ac = entity.transformedAc;
					entity.maxHpMod = entity.transformedMaxHpMod;
				}

				//remove maxHp mod
				const maxHpMod = entity.maxHpMod ? parseInt(entity.maxHpMod) : 0;
				entity.maxHp = maxHpMod > 0 ? entity.maxHp - maxHpMod : entity.maxHp + Math.abs(maxHpMod);

				return this.entitySetter ? this.entitySetter : entity;
			},
			set(newValue) {
				this.entitySetter = newValue;
			},
		},
	},
	methods: {
		...mapActions([
			"setDrawer",
			"add_next_round",
			"set_initiative",
			"edit_entity_prop",
			"display_maxHp",
		]),
		showCondition(key) {
			this.setDrawer({
				show: true,
				type: "drawers/encounter/Condition",
				data: {
					condition: key,
					entity: this.entity,
				},
			});
		},
		percentage(current, max) {
			return current === 0 ? 0 : current / max;
		},
		hpBarColor(percentage) {
			if (percentage < 33) {
				return "negative";
			} else if (percentage < 76) {
				return "warning";
			}
			return "positive";
		},
		displayStats() {
			var stats = "";
			if (this.entity.transformed) {
				stats = {
					ac: this.entity.transformedAc,
					maxHp: this.entity.transformedMaxHp,
					maxHpMod: this.entity.transformedMaxHpMod,
					curHp: this.entity.transformedCurHp,
				};
			} else {
				stats = {
					ac: this.entity.ac,
					maxHp: this.entity.maxHp,
					maxHpMod: this.entity.maxHpMod,
					curHp: this.entity.curHp,
				};
			}
			return stats;
		},
	},
};
</script>

<style lang="scss" scoped>
ul.target-reminders {
	padding-left: 1px;
	list-style: none;
	margin: 0;
	display: none;
	display: flex;
	justify-content: flex-start;
	background: $neutral-7;

	li {
		display: block;
		width: 20px;
		height: 7px;
		margin: 1px 1px 1px 0;
	}
}
</style>
