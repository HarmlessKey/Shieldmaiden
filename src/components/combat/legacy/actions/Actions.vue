<template>
	<div id="actions">
		<template v-if="selectEntity">
			<p>Action performed by:</p>

			<q-select
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				v-model="doneBy"
				:options="_active"
				option-value="key"
				map-options
				emit-value
				autofocus
				options-selected-class="blue"
			>
				<template v-slot:selected>
					<q-item v-if="doneBy" class="selected">
						<q-item-section avatar>
							<Avatar :entity="entitiesList[doneBy]" class="img" :icons="false" />
						</q-item-section>
						<q-item-section>
							<q-item-label v-text="entitiesList[doneBy].name.capitalizeEach()" />
						</q-item-section>
					</q-item>
					<span v-else> Who performs the action? </span>
				</template>
				<template v-slot:option="scope">
					<q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
						<q-item-section avatar>
							<Avatar :entity="scope.opt" class="img" :icons="false" />
						</q-item-section>
						<q-item-section>
							<q-item-label v-text="scope.opt.name?.capitalizeEach()" />
						</q-item-section>
					</q-item>
				</template>
			</q-select>

			<div
				v-if="
					doneBy && entitiesList[doneBy]?.reminders && entitiesList[doneBy]?.reminders?.reaction
				"
				class="reaction-used bg-red px-1 py-2 white mb-2 d-flex justify-between"
			>
				<span>Reaction used</span>
				<q-icon name="fas fa-exclamation" />
			</div>
		</template>

		<!-- ADVANTAGE / DISADVANTAGE -->
		<hk-tip value="advantage" title="Advantage &amp; disadvantage">
			<template #content>
				<p class="mt-2">
					On desktop<br />
					Hold <strong>SHIFT</strong> to roll with <span class="green">advantage</span>,
					<strong>CTRL</strong> for <span class="red">disadvantage</span>.
				</p>
				<span>
					On touch screens<br />
					Hold down on the button to roll with <span class="green">advantage</span> or
					<span class="red">disadvantage</span>.
				</span>
			</template>
		</hk-tip>

		<template v-if="doneBy && entitiesList[doneBy]">
			<q-tabs
				v-model="tab"
				:dark="$store.getters.theme === 'dark'"
				inline-label
				outside-arrows
				mobile-arrows
				no-caps
				dense
				indicator-color="neutral-1"
				class="modes"
			>
				<q-tab
					v-for="({ name, icon, label }, index) in tabs"
					:key="`tab-${index}`"
					:name="name"
					:icon="icon"
					class="bg-neutral-3 neutral-10"
				>
					<q-tooltip anchor="top middle" self="center middle">
						{{ label }}
					</q-tooltip>
				</q-tab>
			</q-tabs>
			<q-tab-panels v-model="tab" class="bg-transparent overflow-visible">
				<q-tab-panel
					:name="name"
					class="overflow-visible"
					v-for="{ name } in tabs"
					:key="`panel-${name}`"
				>
					<Custom
						v-if="name === 'manual'"
						:current="entitiesList[doneBy]"
						:targeted="targeted"
						:autofocus="selectEntity"
					/>
					<template v-if="name === 'roll'">
						<Roll :current="entitiesList[doneBy]" />
					</template>
					<Spellcasting v-if="name === 'spells'" :current="entitiesList[doneBy]" />
				</q-tab-panel>
			</q-tab-panels>
		</template>
		<q-resize-observer @resize="setSize" />
	</div>
</template>

<script>
import _ from "lodash";
import { mapGetters } from "vuex";
import { setHP } from "src/mixins/HpManipulations.js";

import Custom from "./custom";
import Roll from "./Roll.vue";
import Spellcasting from "./Spellcasting.vue";
import { damage_types } from "src/utils/generalConstants";
import Avatar from "../../entities/Avatar.vue";

export default {
	name: "Actions",
	components: {
		Custom,
		Roll,
		Spellcasting,
		Avatar,
	},
	mixins: [setHP],
	props: {
		current: {
			type: Object,
		},
		selectEntity: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			damage_types: damage_types,
			tab: "manual",
			tabs: [{ name: "manual", label: "Custom", icon: "fas fa-keyboard" }],
			doneBySetter: undefined,
			settingsSetter: undefined,
			width: 0,
		};
	},
	mounted() {
		this.tab = this.returnTab(this.entitiesList[this.doneBy]);
		this.tabs = this.returnTabs(this.entitiesList[this.doneBy]);
	},
	computed: {
		...mapGetters(["entities", "targeted", "userSettings"]),
		_active: function () {
			let active = _.chain(this.entities)
				.filter(function (entity, key) {
					entity.key = key;
					return !entity.down;
				})
				.sortBy("name", "asc")
				.value();
			active.unshift({
				key: "environment",
				name: "Environment",
				entityType: "environment",
			});
			return active;
		},
		entitiesList() {
			let list = { ...this.entities };
			list.environment = {
				key: "environment",
				name: "Environment",
				entityType: "environment",
			};
			return list;
		},
		doneBy: {
			get() {
				const key = this.current ? this.current.key : undefined;
				return this.doneBySetter ? this.doneBySetter : key;
			},
			set(newValue) {
				this.doneBySetter = newValue;
			},
		},
		settings: {
			get() {
				const settings =
					this.userSettings && this.userSettings.encounter ? this.userSettings.encounter : {};
				return this.settingsSetter ? this.settingsSetter : settings;
			},
			set(newValue) {
				this.settingsSetter = newValue;
			},
		},
	},
	methods: {
		setSize(size) {
			this.width = size.width;
		},
		returnTabs(current) {
			let tabs = [{ name: "manual", label: "Custom", icon: "fas fa-keyboard" }];
			if (current) {
				if (
					current.special_abilities ||
					current.actions ||
					current.legendary_actions ||
					current.reactions
				) {
					tabs.push({ name: "roll", label: "Actions", icon: "fas fa-dice-d20" });
				}
				if (current.entityType !== "player" && (current.caster_ability || current.innate_ability)) {
					tabs.push({ name: "spells", label: "Spells", icon: "fas fa-wand-magic" });
				}
			}
			return tabs;
		},
		returnTab(current) {
			return (current && ["player", "companion", "environment"].includes(current.entityType)) ||
				this.settings.npcDamageTab
				? "manual"
				: "roll";
		},
	},
	watch: {
		doneBy: {
			deep: true,
			handler(newVal) {
				const current = this.entitiesList[newVal];
				this.tab = this.returnTab(current);
				this.tabs = this.returnTabs(current);
			},
		},
	},
};
</script>

<style lang="scss" scoped>
#actions {
	font-size: 12px;

	.q-field {
		margin-bottom: 15px;

		.q-item {
			&.selected {
				padding: 0;
				min-height: 35px !important;
				line-height: 35px !important;
			}
		}
	}
	&::v-deep {
		.q-tab {
			width: 100%;
		}
	}
}

.modes {
	&::v-deep {
		.q-tabs {
			&__content {
				padding: 10px;
				margin: -10px;
				gap: 0.5rem;

				.q-tab {
					border: solid 1px transparent;
					border-radius: $border-radius;
					width: 100%;

					&:focus {
						outline: $outline;
					}
				}
			}
		}
	}
}

.q-tab-panel {
	padding: 15px 0 0 0 !important;
}
.overflow-visible {
	overflow: visible;
	&::v-deep {
		.q-panel {
			overflow: visible;
		}
	}
}

.img {
	display: block;
	width: 35px;
	height: 35px;
	background-size: cover;
	background-position: top center;
	border: solid 1px $neutral-2;
	font-size: 27px;
	line-height: 35px;
	background-color: $neutral-9;
	color: $neutral-2;

	i {
		vertical-align: 5px !important;
	}
}
.reaction-used {
	font-size: 15px;
	i {
		margin: 4px 5px 0 0;
	}
}

[data-theme="light"] {
	.img {
		background-color: $neutral-2;
		color: $neutral-8;
	}
}
</style>
