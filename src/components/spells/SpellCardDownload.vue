<template>
	<hk-dialog :value="value" :header="header" @input="$emit('input', $event)">
		<hk-loader
			v-if="generating"
			no-background
			prefix="Generating"
			:name="downloadLabel.replace('Download ', '')"
		/>
		<template v-else-if="current_spell">
			<div class="card-colors mb-3">
				<button
					v-for="option in spell_card_colors"
					:key="option.value"
					class="card-colors__swatch"
					:class="{ active: download_color === option.value }"
					:style="{ backgroundColor: option.base }"
					:title="option.label"
					@click="download_color = option.value"
				/>
			</div>

			<div v-if="working_spells.length > 1" class="preview-nav">
				<button
					class="btn btn-sm bg-neutral-5"
					:disabled="current_index === 0"
					@click="current_index--"
				>
					<hk-icon icon="fas fa-chevron-left" />
				</button>
				<span>
					{{ current_index + 1 }} / {{ working_spells.length }}
					<strong>{{ current_spell.name.capitalizeEach() }}</strong>
				</span>
				<button
					class="btn btn-sm bg-neutral-5"
					:disabled="current_index === working_spells.length - 1"
					@click="current_index++"
				>
					<hk-icon icon="fas fa-chevron-right" />
				</button>
			</div>

			<div class="download-preview">
				<SpellCard
					:spell="current_spell"
					:color="download_color"
					editable
					@update:description="setDescription(current_index, $event)"
				/>
			</div>
			<p class="mt-1"><strong>Description overflowing?</strong> Edit it directly on the card.</p>

			<q-checkbox
				v-if="working_spells.length > 1"
				:dark="$store.getters.theme === 'dark'"
				v-model="include_backside"
				label="Include backside"
				class="mt-3"
			/>
		</template>

		<div slot="footer" class="d-flex justify-content-end full-width items-center gap-1">
			<button class="btn" :disabled="generating" @click="download">
				{{ downloadLabel }} <hk-icon :icon="downloadIcon" class="ml-1" />
			</button>
		</div>

		<div v-if="generating" class="offscreen-render" aria-hidden="true">
			<SpellCard
				v-for="(spell, index) in working_spells"
				:key="`front-${index}`"
				ref="front_cards"
				:spell="spell"
				:color="download_color"
			/>
			<template v-if="include_backside">
				<SpellCard
					v-for="(spell, index) in working_spells"
					:key="`back-${index}`"
					ref="back_cards"
					:spell="spell"
					:color="download_color"
					back
				/>
			</template>
		</div>
	</hk-dialog>
</template>

<script>
import _ from "lodash";
import SpellCard from "src/components/spells/SpellCard.vue";
import { spell_card_colors } from "src/utils/spellConstants";
import {
	downloadSpellFile,
	captureElementAsDataUrl,
	downloadCardsPdf,
} from "src/utils/generalFunctions";

export default {
	name: "SpellCardDownload",
	components: {
		SpellCard,
	},
	props: {
		// v-model: dialog open state
		value: {
			type: Boolean,
			default: false,
		},
		// Full, ready-to-render spell docs (the caller is responsible for loading them -
		// this component only previews/downloads, it never fetches spell data itself).
		spells: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			generating: false,
			download_color: "cyan",
			include_backside: false,
			current_index: 0,
			// Edited descriptions, keyed by index into `spells` rather than a spell id,
			// since a not-yet-saved spell (previewed from the creator) has no key yet.
			descriptions_by_index: {},
			spell_card_colors,
		};
	},
	computed: {
		working_spells() {
			return this.spells.map((spell, index) => ({
				...spell,
				description:
					index in this.descriptions_by_index
						? this.descriptions_by_index[index]
						: spell.description,
			}));
		},
		current_spell() {
			return this.working_spells[this.current_index];
		},
		header() {
			const [spell] = this.working_spells;
			return this.working_spells.length === 1
				? `Download ${spell && spell.name ? spell.name.capitalizeEach() : "spell"}`
				: "Download spell cards";
		},
		downloadLabel() {
			return this.working_spells.length === 1 && !this.include_backside
				? "Download PNG"
				: "Download PDF";
		},
		downloadIcon() {
			return this.working_spells.length === 1 && !this.include_backside
				? "fas fa-image"
				: "fas fa-file-pdf";
		},
	},
	watch: {
		value(open) {
			if (open) {
				this.current_index = 0;
				this.descriptions_by_index = {};
				// This component instance stays mounted between opens (no v-if at the call
				// site), so a stale "Include backside" from a previous batch download would
				// otherwise silently turn a single-card download into a PDF.
				this.include_backside = false;
			}
		},
	},
	methods: {
		setDescription(index, value) {
			this.$set(this.descriptions_by_index, index, value);
		},
		async download() {
			this.generating = true;
			await this.$nextTick();
			await this.$nextTick();

			// A single card with no backside stays a plain PNG, matching the original
			// single-spell download exactly. Everything else (a batch, or a single card
			// with its backside included) becomes an A4 grid PDF.
			if (this.working_spells.length === 1 && !this.include_backside) {
				await downloadSpellFile(this.$refs.front_cards[0].$el, {
					filename: `${this.working_spells[0].name} (Shieldmaiden)`,
				});
			} else {
				const front_images = [];
				for (const card of this.$refs.front_cards) {
					front_images.push(await captureElementAsDataUrl(card.$el));
				}
				const back_images = [];
				if (this.include_backside) {
					for (const card of this.$refs.back_cards) {
						back_images.push(await captureElementAsDataUrl(card.$el));
					}
				}

				const front_pages = _.chunk(front_images, 9);
				const back_pages = this.include_backside ? _.chunk(back_images, 9) : [];

				// Interleaved so each sheet's backs immediately follow its fronts: fronts 1,
				// backs 1, fronts 2, backs 2, ... rather than all fronts then all backs.
				const pages = [];
				front_pages.forEach((front_page, index) => {
					pages.push(front_page);
					if (back_pages[index]) pages.push(back_pages[index]);
				});

				const filename =
					this.working_spells.length === 1
						? `${this.working_spells[0].name} (Shieldmaiden)`
						: "Spell cards (Shieldmaiden)";
				await downloadCardsPdf(pages, { filename });
			}

			this.generating = false;
			this.$emit("input", false);
		},
	},
};
</script>

<style lang="scss" scoped>
.preview-nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5em;
	text-align: center;
}

.download-preview {
	display: flex;
	justify-content: center;
	margin: 0.5em 0;
}

.offscreen-render {
	position: fixed;
	top: -9999px;
	left: -9999px;
	pointer-events: none;
}

.card-colors {
	display: flex;
	justify-content: center;
	gap: 0.5em;

	&__swatch {
		width: 2em;
		height: 2em;
		border-radius: 50%;
		border: solid 2px transparent;
		cursor: pointer;

		&.active {
			border-color: $neutral-1;
		}
	}
}
</style>
