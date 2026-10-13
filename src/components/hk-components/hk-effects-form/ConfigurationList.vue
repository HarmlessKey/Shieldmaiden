<template>
	<div class="configuration-list">
		<component
			:is="nested ? 'div' : 'h3'"
			class="configuration-list__header d-flex justify-content-between items-center"
			:class="{ 'neutral-2': nested }"
		>
			Configuration
			<a v-if="available.length" class="btn btn-sm bg-neutral-5">
				<i aria-hidden="true" class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
				<q-tooltip anchor="top middle" self="center middle">Add configuration</q-tooltip>
				<q-popup-proxy :dark="dark">
					<div class="bg-neutral-9 configuration-list__menu">
						<q-list :dark="dark">
							<q-item
								v-for="configuration in available"
								:key="configuration.key"
								clickable
								v-close-popup
								@click="add(configuration.key)"
							>
								<q-item-section avatar>
									<i aria-hidden="true" class="fas fa-plus"></i>
								</q-item-section>
								<q-item-section>
									<q-item-label>{{ configuration.label }}</q-item-label>
									<q-item-label caption>{{ configuration.description }}</q-item-label>
								</q-item-section>
							</q-item>
						</q-list>
					</div>
				</q-popup-proxy>
			</a>
		</component>

		<p v-if="!selectedConfigurations.length" class="neutral-2 mb-0">No configuration.</p>
		<q-list v-else :dark="dark" class="accordion">
			<q-expansion-item
				v-for="configuration in selectedConfigurations"
				:key="configuration.key"
				:dark="dark"
				switch-toggle-side
			>
				<template v-slot:header>
					<q-item-section v-if="summaries[configuration.key].incomplete" avatar>
						<q-icon name="error" color="red" />
						<q-tooltip anchor="top middle" self="center middle">Not finished</q-tooltip>
					</q-item-section>
					<q-item-section class="truncate">{{ configuration.label }}</q-item-section>
					<q-item-section avatar>
						<div class="d-flex gap-1">
							<button class="btn btn-sm bg-neutral-5" @click.stop.prevent="editing = configuration.key">
								<i aria-hidden="true" class="fas fa-pencil" />
								<q-tooltip anchor="top middle" self="center middle">Edit</q-tooltip>
							</button>
							<button class="btn btn-sm bg-neutral-5" @click.stop.prevent="$emit('remove', configuration.key)">
								<i aria-hidden="true" class="fas fa-trash-alt red" />
								<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
							</button>
						</div>
					</q-item-section>
				</template>
				<div class="accordion-body">
					{{ summaries[configuration.key].text }}
				</div>
			</q-expansion-item>
		</q-list>

		<q-dialog :value="!!editingConfiguration" @input="(open) => !open && (editing = undefined)">
			<hk-card v-if="editingConfiguration" class="configuration-list__dialog">
				<div slot="header" class="card-header">
					{{ editingConfiguration.label }}
					<q-btn icon="close" no-caps flat dense v-close-popup />
				</div>
				<div class="card-body">
					<p class="neutral-2">{{ editingConfiguration.description }}</p>
					<slot name="editor" :configuration="editingConfiguration" />
				</div>
				<div slot="footer" class="card-footer d-flex justify-content-end">
					<q-btn label="Done" color="primary" no-caps v-close-popup />
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
import { summarizeConfiguration } from "./configurationSummaries";

/**
 * The optional configuration of an effect or a sub-effect (design decision 11): an "Add"
 * menu, an accordion item per configuration with its settings in words, and a dialog to edit
 * it. The parent adds and removes the values (`add` / `remove` events) and renders the
 * inputs in the `editor` slot.
 */
export default {
	name: "ConfigurationList",
	props: {
		// The effect or sub-effect
		target: { type: Object, required: true },
		level: { type: String, required: true, validator: (v) => ["effect", "sub_effect"].includes(v) },
		// All configurations ({ key, label, description }), in display order
		configurations: { type: Array, required: true },
		// Keys of the selected configurations
		selected: { type: Array, required: true },
		// A sub-effect's list: smaller header
		nested: { type: Boolean, default: false },
	},
	data() {
		return { editing: undefined };
	},
	computed: {
		dark() {
			return this.$store.getters.theme === "dark";
		},
		selectedConfigurations() {
			return this.configurations.filter(({ key }) => this.selected.includes(key));
		},
		available() {
			return this.configurations.filter(({ key }) => !this.selected.includes(key));
		},
		summaries() {
			return Object.fromEntries(
				this.selectedConfigurations.map(({ key }) => [key, summarizeConfiguration(this.level, key, this.target)])
			);
		},
		editingConfiguration() {
			return this.configurations.find(({ key }) => key === this.editing);
		},
	},
	methods: {
		add(key) {
			this.$emit("add", key);
			// A new configuration opens in the dialog right away
			this.editing = key;
		},
	},
};
</script>

<style lang="scss" scoped>
// Like the section headers of the NPC abilities form
.configuration-list__header {
	border-bottom: solid 1px $neutral-4;
	font-size: 15px;
	margin-bottom: 1px;
	padding-bottom: 4px;
}
.configuration-list__menu {
	max-width: 400px;
}
.configuration-list__dialog {
	width: 700px;
	max-width: 90vw;
}
</style>
