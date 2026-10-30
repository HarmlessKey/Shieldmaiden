<template>
	<div>
		<q-tabs
			v-if="groups.length > 1"
			v-model="shownTab"
			:dark="$store.getters.theme === 'dark'"
			dense
			inline-label
			no-caps
			align="justify"
			class="bg-neutral-9 mb-2"
		>
			<q-tab
				v-for="group in groups"
				:key="group.name"
				:name="group.name"
				:label="`${group.name} (${group.entries.length})`"
			/>
		</q-tabs>
		<q-list :dark="$store.getters.theme === 'dark'" square class="accordion">
			<q-expansion-item
				v-for="entry in paged"
				:key="entry.id"
				:value="expanded === entry.id"
				:dark="$store.getters.theme === 'dark'"
				switch-toggle-side
				@input="toggle(entry, $event)"
			>
				<template v-slot:header>
					<q-item-section>
						<div class="d-flex justify-content-start items-center">
							<i
								v-if="entry.isCondition"
								aria-hidden="true"
								:class="`hki-${entry.sourceKey}`"
								class="icon"
							/>
							<span class="truncate">{{ entry.name }}</span>
							<span
								v-if="entry.sourceKey === 'exhaustion' && exhaustionLevel !== undefined"
								class="exhaustion neutral-11 ml-2"
							>
								{{ exhaustionLevel || "?" }}
								<q-tooltip anchor="top middle" self="center middle">
									{{ exhaustionLevel ? `Level ${exhaustionLevel}` : "Levels differ between targets" }}
								</q-tooltip>
							</span>
						</div>
					</q-item-section>

					<q-item-section avatar>
						<div class="d-flex items-center">
							<span v-if="presence(entry) !== 'none'" class="presence mr-2" :class="presence(entry)">
								<q-tooltip anchor="top middle" self="center middle">
									{{ presence(entry) === "all" ? "All targets" : "Some targets" }}
								</q-tooltip>
							</span>
							<button
								v-if="presence(entry) !== 'none'"
								type="button"
								class="btn btn-sm btn-clear"
								@click.stop="$emit('remove', entry)"
							>
								<i aria-hidden="true" class="fas fa-minus-circle red" />
								<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
							</button>
							<button
								type="button"
								class="btn btn-sm btn-clear"
								:disabled="disabled"
								@click.stop="onApplyClick(entry, $event)"
							>
								<i aria-hidden="true" class="fas fa-plus-circle green" />
								<q-tooltip anchor="top middle" self="center middle">
									Apply (shift+click: until removed)
								</q-tooltip>
								<q-menu
									:value="applying === entry.id"
									:dark="$store.getters.theme === 'dark'"
									anchor="bottom right"
									self="top right"
									no-parent-event
									square
									@input="applying = $event ? entry.id : undefined"
								>
									<div class="apply-menu">
										<ApplyEffect
											:definition="definitionOf(entry) || { name: entry.name }"
											:conditions="conditions"
											:default-level="defaultLevel"
											:effect="{ source: entry.source, source_key: entry.sourceKey, name: entry.name }"
											:casters="casters"
											:default-caster="defaultCaster"
											:caster-concentration="casterConcentration"
											:preset-choices="presetChoices(entry)"
											@apply="apply(entry, $event)"
											@cancel="applying = undefined"
										/>
									</div>
								</q-menu>
							</button>
						</div>
					</q-item-section>
				</template>

				<div class="accordion-body">
					<q-spinner v-if="loading === entry.id" />
					<EffectDetails v-else :definition="definitionOf(entry)" :edition="edition" />
				</div>
			</q-expansion-item>
		</q-list>
		<!-- As hk-table's pagination -->
		<q-pagination
			v-if="pages > 1"
			v-model="page"
			class="pagination"
			:max="pages"
			:max-pages="5"
			color="dark"
			:direction-links="true"
			:boundary-links="true"
		/>
	</div>
</template>

<script>
import EffectDetails from "src/components/drawers/encounter/effects/EffectDetails.vue";
import ApplyEffect from "src/components/drawers/encounter/effects/ApplyEffect.vue";
import { getRequiredChoices } from "src/utils/effectFunctions.js";

// Entries per page; DMs mostly search for the effect they need
const PAGE_SIZE = 10;

/**
 * A list of effects to apply, the same in every drawer (effects 12): each entry expands to its
 * details, the apply button opens the apply form in a popover, shift+click applies until removed.
 * A tab per group when there are several, 10 entries per page. The drawer applies and removes.
 *
 * Groups: [{ name, entries: [{ id, source, sourceKey, name, isCondition }] }], without empty ones
 *
 * @emits apply (entry, application)
 * @emits remove (entry)
 */
export default {
	name: "EffectList",
	components: { EffectDetails, ApplyEffect },
	props: {
		groups: {
			type: Array,
			required: true,
		},
		// entry => its definition, or undefined
		definitionOf: {
			type: Function,
			required: true,
		},
		// async entry => loads its definition (a custom effect), before details and applying
		loadDefinition: {
			type: Function,
			default: async () => {},
		},
		edition: {
			type: String,
			default: undefined,
		},
		// SRD conditions of the edition, for condition choices
		conditions: {
			type: Array,
			default: () => [],
		},
		// Caster options [{ label, value }], "None" is added
		casters: {
			type: Array,
			default: () => [],
		},
		defaultCaster: {
			type: String,
			default: undefined,
		},
		// casterKey => the caster's Concentration { key, for }, or undefined
		casterConcentration: {
			type: Function,
			default: () => undefined,
		},
		// Level offered for Exhaustion
		defaultLevel: {
			type: Number,
			default: 1,
		},
		// The targets' Exhaustion level: undefined if none have it, false if levels differ
		exhaustionLevel: {
			type: [Number, Boolean],
			default: undefined,
		},
		// entry => whether "all", "some" or "none" of the targets have it; shows Remove
		presence: {
			type: Function,
			default: () => "none",
		},
		// entry => choices already made, not asked (a bonus drawer)
		presetChoices: {
			type: Function,
			default: () => undefined,
		},
		// Listed, but can't be applied
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			expanded: undefined,
			// Entry whose apply popover is open
			applying: undefined,
			loading: undefined,
			// The selected group's name
			tab: undefined,
			page: 1,
		};
	},
	computed: {
		// The selected group, the first when it has no entries (a search)
		current() {
			return this.groups.find(({ name }) => name === this.tab) || this.groups[0];
		},
		// The shown tab; the selection is kept while a search hides it
		shownTab: {
			get() {
				return this.current?.name;
			},
			set(name) {
				this.tab = name;
			},
		},
		entries() {
			return this.current?.entries || [];
		},
		pages() {
			return Math.ceil(this.entries.length / PAGE_SIZE);
		},
		// The entries on the current page
		paged() {
			return this.entries.slice((this.page - 1) * PAGE_SIZE, this.page * PAGE_SIZE);
		},
		// The listed entries, to go back to the first page when they change (a search, a tab)
		entryIds() {
			return this.entries.map(({ id }) => id).join();
		},
	},
	watch: {
		entryIds() {
			this.page = 1;
		},
	},
	methods: {
		async load(entry) {
			this.loading = entry.id;
			try {
				await this.loadDefinition(entry);
			} finally {
				this.loading = undefined;
			}
		},
		async toggle(entry, open) {
			this.expanded = open ? entry.id : undefined;
			if (open) await this.load(entry);
		},
		/**
		 * Opens the apply popover, shift+click applies until removed
		 */
		async onApplyClick(entry, event) {
			if (this.disabled) return;
			await this.load(entry);
			if (event.shiftKey) this.quickApply(entry);
			else this.applying = entry.id;
		},
		/**
		 * Applies until removed, or opens the popover when the effect needs choices that aren't
		 * preset. Exhaustion gets the default level.
		 */
		quickApply(entry) {
			const preset = this.presetChoices(entry) || {};
			const required = getRequiredChoices(this.definitionOf(entry));
			if (required.some(({ kind }) => preset[kind] === undefined)) {
				this.applying = entry.id;
				return;
			}
			const application = { duration: { type: "cancelled" } };
			if (required.length) {
				application.choices = Object.fromEntries(required.map(({ kind }) => [kind, String(preset[kind])]));
			}
			if (entry.sourceKey === "exhaustion") application.level = this.defaultLevel;
			this.apply(entry, application);
		},
		apply(entry, application) {
			this.applying = undefined;
			this.$emit("apply", entry, application);
		},
	},
};
</script>

<style lang="scss" scoped>
.q-item__section {
	line-height: 27px;

	.icon {
		color: $neutral-3;
		font-size: 23px;
		margin-right: 12px;
	}
	button {
		border-radius: 50%;
		height: 35px;
		width: 35px;
		margin: -8px 0;

		&:focus {
			outline: none;
			background-color: $neutral-5 !important;
		}
	}
	.exhaustion {
		display: block;
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: $red;
		text-align: center;
		font-size: 12px;
		line-height: 15px;
		font-weight: bold !important;
	}
	.presence {
		display: block;
		width: 8px;
		height: 8px;
		border-radius: 50%;

		&.all {
			background: $green;
		}
		&.some {
			border: solid 2px $green;
		}
	}
}
.apply-menu {
	width: 300px;
	padding: 0 10px;
}
.pagination {
	margin-top: 10px;
}
</style>
