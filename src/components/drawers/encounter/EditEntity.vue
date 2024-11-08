<template>
	<div>
		<h2>Edit {{ entity ? "entity" : "entities" }}</h2>
		<ul class="targets">
			<li v-for="(target, i) in edit_targets" :key="`target=${i}`">
				<TargetItem :item="target" :i="i" />
			</li>
		</ul>
		<hr />

		<!-- SINGLE ENTITY -->
		<template v-if="entity">
			<button
				v-if="entity.transformed"
				class="btn btn-block bg-red mb-2"
				@click="transform_entity({ key: entity.key, remove: true })"
			>
				Remove transformation
			</button>
			<q-input
				v-if="entity.entityType === 'npc'"
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				label="Name"
				autocomplete="off"
				type="text"
				name="name"
				v-model="entity.name"
				class="mb-2"
				placeholder="Name"
				@change="editValue('name', entity.name)"
			/>

			<div class="d-flex justify-content-between mb-2">
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label="Initiative"
					autocomplete="off"
					type="number"
					name="initiative"
					min="0"
					v-model="entity.initiative"
					placeholder="Initiative"
					autofocus
					@change="set_initiative({ key: entity.key, initiative: entity.initiative })"
				></q-input>

				<!-- Color label (Only for NPC's) -->
				<q-input
					v-if="entity.entityType === 'npc'"
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					v-model="entity.color_label"
					label="Color label"
					readonly
					class="ml-1"
				>
					<template v-slot:append>
						<q-icon name="colorize" class="cursor-pointer" :style="`color: ${entity.color_label};`">
							<q-popup-proxy square transition-show="scale" transition-hide="scale">
								<q-color
									square
									:dark="$store.getters.theme === 'dark'"
									v-model="entity.color_label"
									:palette="shieldmaiden_colors"
									default-view="palette"
									@input="editValue('color_label', entity.color_label)"
								/>
							</q-popup-proxy>
						</q-icon>
					</template>
				</q-input>
			</div>

			<!-- Initiative, AC bonus and TempHp -->
			<hr />
			<div class="d-flex justify-content-between">
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label="AC Bonus"
					autocomplete="off"
					type="number"
					name="ac_bonus"
					v-model="entity.ac_bonus"
					placeholder="AC Bonus"
					@change="editValue('ac_bonus', entity.ac_bonus)"
				></q-input>

				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label="Temp HP"
					autocomplete="off"
					type="number"
					name="tempHp"
					class="mx-1"
					v-model="entity.tempHp"
					placeholder="Temporary Hit Points"
					@change="editValue('tempHp', entity.tempHp)"
				></q-input>

				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label-slot
					autocomplete="off"
					type="number"
					name="maxHpMod"
					min="0"
					v-model="entity.maxHpMod"
					placeholder="Modifier"
					@change="editValue('maxHpMod', entity.maxHpMod)"
				>
					<template v-slot:label>
						<i aria-hidden="true" v-if="entity.transformed" class="fas fa-paw-claws green" />
						Max HP Mod
					</template>
				</q-input>
			</div>

			<!-- Override values: AC, maxHp, curHp -->
			<hr />
			<h2 class="mb-2">Override</h2>
			<div class="d-flex justify-content-between">
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label-slot
					autocomplete="off"
					class="mr-1"
					type="number"
					name="ac"
					min="1"
					v-model="entity.ac"
					@change="editValue('ac', entity.ac)"
				>
					<template v-slot:label>
						<i aria-hidden="true" v-if="entity.transformed" class="fas fa-paw-claws green" />
						Armor class
					</template>
				</q-input>
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label-slot
					autocomplete="off"
					class="mr-1"
					type="number"
					name="maxHp"
					min="0"
					v-model="entity.maxHp"
					placeholder="Maximum Hit Points"
					@change="editValue('maxHp', entity.maxHp)"
				>
					<template v-slot:label>
						<i aria-hidden="true" v-if="entity.transformed" class="fas fa-paw-claws green" />
						Max HP
					</template>
				</q-input>

				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					autocomplete="off"
					label-slot
					type="number"
					name="curHp"
					min="0"
					v-model="entity.curHp"
					placeholder="Current Hit Points"
					@change="editValue('curHp', entity.curHp)"
				>
					<template v-slot:label>
						<i aria-hidden="true" v-if="entity.transformed" class="fas fa-paw-claws green" />
						Cur HP
					</template>
				</q-input>
			</div>

			<!-- Display settings NPC's (Live initiative screen) -->
			<template v-if="!demo && entity.entityType === 'npc'">
				<hr />
				<span class="justify-content-between d-flex items-center">
					<h2 class="mb-1">Display Override</h2>
					<a @click="clearOverrides()" class="red btn btn-clear btn-sm">
						<span class="mr-1 small">Clear</span>
						<i aria-hidden="true" class="fas fa-broom small"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Clear display overrides
						</q-tooltip>
					</a>
				</span>

				<!-- NPC DISPLAY SETTING -->
				<q-select
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					dense
					v-for="(setting, index) in npcsOptions"
					:options="setting.options"
					:value="index"
					class="mb-1"
					:key="`setting-${index}`"
				>
					<q-item slot="selected" dense>
						<q-item-section avatar>
							<q-icon :name="setting.icon" size="small" />
						</q-item-section>
						<q-item-section>
							<q-item-label v-text="setting.name" />
						</q-item-section>
						<q-item-section side>
							<q-icon
								:name="
									entity.settings && entity.settings[setting.key] !== undefined
										? displaySetting(index, setting.key, entity.settings[setting.key]).icon
										: displaySetting(index, setting.key, undefined).icon
								"
								:class="
									entity.settings && entity.settings[setting.key] !== undefined
										? displaySetting(index, setting.key, entity.settings[setting.key]).color
										: displaySetting(index, setting.key, undefined).color
								"
								size="small"
							/>
						</q-item-section>
					</q-item>
					<template v-slot:option="scope">
						<q-item
							clickable
							v-ripple
							v-close-popup
							:active="isActive(setting.key, scope.opt)"
							@click="setSetting(setting.key, scope.opt.value)"
						>
							<q-item-section>
								<q-item-label v-text="scope.opt.name" />
							</q-item-section>
							<q-item-section avatar>
								<q-icon :name="scope.opt.icon" size="small" :class="scope.opt.color" />
							</q-item-section>
						</q-item>
					</template>
				</q-select>
			</template>
		</template>

		<!-- MULTIPLE ENTITIES -->
		<template v-else-if="edit_targets.length > 1">
			<q-input
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				label="AC Bonus"
				autocomplete="off"
				type="number"
				name="ac_bonus"
				v-model="ac_bonus"
				placeholder="AC Bonus"
				@change="editValue('ac_bonus', ac_bonus)"
			/>

			<q-input
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				label="Temp HP"
				autocomplete="off"
				type="number"
				name="tempHp"
				class="my-2"
				v-model="tempHp"
				placeholder="Temporary Hit Points"
				@change="editValue('tempHp', tempHp)"
			/>

			<q-input
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				label="Max HP Modifier"
				autocomplete="off"
				type="number"
				name="maxHpMod"
				min="0"
				v-model="maxHpMod"
				placeholder="Modifier"
				@change="editValue('maxHpMod', maxHpMod)"
			/>

			<p class="mt-4">
				These values will be set for all targeted entities. If one of the entities all ready has
				this value set, it will be <span class="red">overwritten</span> with the new value.
			</p>
		</template>

		<p class="mt-4" v-else>Select one or multiple targets to edit.</p>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import TargetItem from "src/components/combat/TargetItem.vue";
import { colors } from "src/mixins/colors";

export default {
	name: "EditEntity",
	components: {
		TargetItem,
	},
	props: ["data"],
	mixins: [colors],
	data() {
		return {
			demo: this.$route.name === "Demo",
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			maxHpMod: undefined,
			tempHp: undefined,
			ac_bonus: undefined,
			npcsOptions: [
				{
					key: "name",
					entity: "npc",
					name: "Name",
					icon: "fas fa-helmet-battle",
					options: [
						{
							value: false,
							name: "Hidden",
							action: "Hide",
							icon: "fas fa-eye-slash",
							color: "red",
						},
						{
							value: true,
							name: "Shown",
							action: "Show",
							icon: "fas fa-eye",
							color: "green",
							settings_default: true,
						},
					],
				},
				{
					key: "health",
					entity: "npc",
					name: "Health",
					icon: "fas fa-heart",
					options: [
						{
							value: false,
							name: "Hidden",
							action: "Hide",
							icon: "fas fa-eye-slash",
							color: "red",
							settings_default: true,
						},
						{
							value: "obscured",
							name: "Obscured",
							action: "Obsc",
							icon: "fas fa-question-circle",
							color: "orange",
						},
						{ value: true, name: "Shown", action: "Show", icon: "fas fa-eye", color: "green" },
					],
				},
				{
					key: "ac",
					entity: "npc",
					name: "Armor Class",
					icon: "fas fa-shield",
					options: [
						{
							value: false,
							name: "Hidden",
							action: "Hide",
							icon: "fas fa-eye-slash",
							color: "red",
							settings_default: true,
						},
						{ value: true, name: "Shown", action: "Show", icon: "fas fa-eye", color: "green" },
					],
				},
			],
		};
	},
	computed: {
		...mapGetters(["entities", "targeted", "userSettings"]),
		edit_targets() {
			if (this.data?.length > 0) {
				return this.data;
			}
			return this.targeted;
		},
		entity: {
			get() {
				if (this.edit_targets.length === 1) {
					let entity = { ...this.entities[this.edit_targets[0]] };

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
				}
				return undefined;
			},
			set(newValue) {
				this.entitySetter = newValue;
			},
		},
		npcSettings() {
			return this.userSettings && this.userSettings.track ? this.userSettings.track.npc : undefined;
		},
	},
	methods: {
		...mapActions([
			"set_initiative",
			"edit_entity_prop",
			"transform_entity",
			"set_entity_setting",
			"clear_entity_settings",
		]),
		editValue(prop, value) {
			for (const key of this.edit_targets) {
				const entity = this.entities[key];
				this.edit_entity_prop({
					key,
					entityType: entity.entityType,
					prop,
					value,
				});
			}
		},
		setSetting(key, value) {
			value = value === undefined ? null : value;
			this.set_entity_setting({ entityId: this.entity.key, key, value });
		},
		isActive(key, option) {
			if (this.entity_settings && this.entity_settings[key] !== undefined) {
				return this.entity_settings[key] == option.value;
			} else if (
				this.npcSettings &&
				this.npcSettings[key] === undefined &&
				option.settings_default
			) {
				return true;
			} else if (this.npcSettings && this.npcSettings[key] == option.value) {
				return true;
			} else if (this.npcSettings == undefined && option.settings_default) return true;
			else return false;
		},
		clearOverrides() {
			this.clear_entity_settings(this.entity.key);
		},
		displaySetting(index, key, value) {
			const settings_default = this.npcsOptions[index].options.filter((item) => {
				return "settings_default" in item;
			})[0];

			if (value === undefined) {
				if (this.npcSettings)
					value =
						this.npcSettings[key] === undefined ? settings_default.value : this.npcSettings[key];
				else value = settings_default.value;
			}

			return this.npcsOptions[index].options.filter((item) => {
				return item.value == value;
			})[0];
		},
	},
};
</script>

<style lang="scss" scoped>
ul.targets {
	list-style: none;
	padding: 0;

	li {
		margin-bottom: 2px !important;
		border: solid 1px transparent;
	}
}
.q-input {
	width: 100%;
}
.q-field__control {
	.q-item {
		width: 100%;
	}
}
</style>
