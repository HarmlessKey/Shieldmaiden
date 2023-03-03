<template>
	<div class="content">
		<h2 class="spellTitle d-flex justify-content-between" v-if="old_spell">
			{{ old_spell.name }}
		</h2>

		<div class="spell-wrapper" v-if="canEdit()">
			<template v-if="old_spell">
				<div class="row q-col-gutter-md">
					<div class="col-12 col-md-4" id="old_spell">
						<hk-card header="Old Spell Description" v-if="loading">
							<hk-loader name="old spell" />
						</hk-card>
						<hk-card class="old_spell" v-else>
							<div class="card-header d-flex justify-content-between" slot="header">
								<a @click="preview('old')" :class="preview_spell == 'old' ? 'selected' : ''"
									>Old Spell Description</a
								>
								<a @click="preview('new')" :class="preview_spell == 'new' ? 'selected' : ''"
									>New Spell Description</a
								>
							</div>
							<div v-if="preview_spell == 'old'">
								<a class="btn btn-block mb-3" @click="parse_old_spell()">
									<i aria-hidden="true" class="fas fa-wand-magic"></i>
									<span class="d-none d-md-inline ml-1">Parse to new spell</span>
								</a>

								<h1 class="spellTitle">
									<a
										v-if="old_spell.name"
										:href="`https://www.dndbeyond.com/spells/${toKebabCase(old_spell.name)}`"
										target="_blank"
										rel="noopener"
										>{{ old_spell.name }}</a
									>
								</h1>
								<i aria-hidden="true" class="mb-3 d-block" v-if="old_spell.school">
									{{ spell_levels[old_spell.level] }}
									{{ old_spell.school.name }}
								</i>

								<p>
									<strong>Casting time:</strong> {{ old_spell.casting_time }}<br />
									<strong>Range:</strong> {{ old_spell.range }}<br />
									<strong>Components:</strong>
									<template v-for="(component, index) in old_spell.components">
										{{ component
										}}<template v-if="Object.keys(old_spell.components).length > index + 1"
											>,
										</template>
									</template>
									<template v-if="old_spell.material"> ({{ old_spell.material }})</template>
									<br />
									<strong>Duration:</strong>
									<template v-if="old_spell.concentration == 'yes'"> Concentration, </template>
									{{ old_spell.duration }}<br />
									<strong>Classes:</strong>
									<template v-for="(_class, index) in old_spell.classes">
										{{ _class.name
										}}<template v-if="Object.keys(old_spell.classes).length > index + 1"
											>,
										</template>
									</template>
									<br />
								</p>
								<p v-for="(desc, index) in old_spell.desc" :key="index">
									{{ desc }}
								</p>

								<p v-if="old_spell.higher_level">
									At higher levels.
									<template v-for="higher in old_spell.higher_level">
										{{ higher }}
									</template>
								</p>
							</div>
							<!-- card-body -->
							<!-- New spell preview active -->
							<div v-else>
								<!-- <ViewSpell :data="spell" :no_roll="true" /> -->
							</div>
						</hk-card>
					</div>

					<div class="col-12 col-md-8">
						<EditSpell :id="id" @set-unsaved="setUnsaved" ref="editForm" />
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import { db } from "src/firebase";
import EditSpell from "src/views/userContent/Spells/EditSpell";
// import ViewSpell from "./ViewSpell.vue";
import { general } from "src/mixins/general";
import { spells } from "src/mixins/spells";
import { mapGetters } from "vuex";

export default {
	name: "ContribSpellEdit",
	components: {
		EditSpell,
	},
	mixins: [general, spells],
	data() {
		return {
			userId: this.$store.getters.user.uid,
			id: this.$route.params.id,
			loading: true,
			validators: {},
			unsaved_changes: false,
			fb_spell_json: {},
			preview_spell: "old",
		};
	},
	computed: {
		...mapGetters(["tier", "userInfo"]),
	},
	firebase() {
		return {
			old_spell: {
				source: db.ref(`spells/${this.id}`),
				asObject: true,
				readyCallback: () => (this.loading = false),
			},
		};
	},
	methods: {
		canEdit() {
			return (
				(this.old_spell.metadata && this.old_spell.metadata.tagged === this.userId) ||
				this.userInfo.admin
			);
		},
		setUnsaved(value) {
			this.unsaved_changes = value;
		},
		preview(type) {
			this.preview_spell = type;
		},
		parse_old_spell() {
			const spell = {};
			// Parse values from old_spell object to new spell object

			// TODO:
			// Check if the parsed value is actually a valid value (e.g. available in dropdown)

			// Parse simple values
			spell.name = this.old_spell.name;
			spell.school = this.old_spell.school.name.toLowerCase();
			spell.ritual = this.old_spell.ritual == "yes" ? true : null;
			spell.level = this.old_spell.level == -1 ? 0 : this.old_spell.level;
			spell.level_scaling = this.old_spell.higher_level ? undefined : "none";

			// Parse range options
			if (parseInt(this.old_spell.range)) {
				spell.range_type = "ranged";
				let range_list = this.old_spell.range.split(" ");
				let rangeN = parseInt(range_list[0]);
				// Parse miles to feet
				if (range_list[1].includes("mile")) {
					rangeN *= 5280;
				}
				spell.range = rangeN;
			} else {
				spell.range_type = this.old_spell.range.toLowerCase();
				delete spell.range;
			}

			// Parse casting time
			let cast_time = this.old_spell.casting_time.split(" ");
			spell.cast_time_nr = parseInt(cast_time[0]);
			let cast_type = cast_time[1];

			if (cast_type[cast_type.length - 1] == "s") {
				cast_type = cast_type.substring(0, cast_type.length - 1);
			}
			spell.cast_time_type = cast_type;
			delete spell.casting_time;

			// Parse components
			spell.components = [];
			for (let i in this.old_spell.components) {
				if (this.old_spell.components[i] == "V") {
					spell.components.push("verbal");
				}
				if (this.old_spell.components[i] == "S") {
					spell.components.push("somatic");
				}
				if (this.old_spell.components[i] == "M") {
					spell.components.push("material");
				}
			}
			if (this.old_spell.material) {
				spell.material_description = this.parse_spell_str(this.old_spell.material);
				delete spell.material;
			}

			// Parse duration
			// If a number in duration duration = concentration or time
			if (/\d/.test(this.old_spell.duration)) {
				let duration_list = this.old_spell.duration.split(" ");
				if (this.old_spell.concentration == "yes") {
					spell.duration_type = "concentration";
					duration_list = duration_list.slice(2);
				} else {
					spell.duration_type = "time";
				}

				// Find duration time number and scale
				spell.duration_n = parseInt(duration_list[0]);
				// Calculate time scale
				let scale = duration_list[1];
				scale = scale.charAt(0).toUpperCase() + scale.substring(1);
				if (scale[scale.length - 1] == "s") {
					scale = scale.substring(0, scale.length - 1);
				}
				spell.duration_scale = scale.toLowerCase();
			} else {
				spell.duration_type = this.old_spell.duration.toLowerCase();
			}

			// Parse Description
			spell.description = "";
			for (let i in this.old_spell.desc) {
				if (i != 0) spell.description += "\n\n"; // Add white line before each paragraph after first
				spell.description += this.parse_spell_str(this.old_spell.desc[i]);
			}

			spell.higher_level = "";
			for (let i in this.old_spell.higher_level) {
				spell.higher_level += this.parse_spell_str(this.old_spell.higher_level[i]);
			}

			// Parse classes
			let classes = [];
			for (let index in this.old_spell.classes) {
				classes.push(this.old_spell.classes[index].name.toLowerCase());
			}
			spell.classes = classes;

			// Source book
			spell.source = this.old_spell.page;

			// Make spell responsive
			this.$refs.editForm.setSpell(spell);
		},
		parse_spell_str(text) {
			// map to replace weird character with real character
			let rules = [
				{
					regex: /â€™/g,
					// eslint-disable-next-line
					replacement: "'",
				},
				{
					regex: /â€”/g,
					// eslint-disable-next-line
					replacement: "\-\-",
				},
				{
					regex: /â€�/g,
					// eslint-disable-next-line
					replacement: '"',
				},
				{
					regex: /â€œ/g,
					// eslint-disable-next-line
					replacement: '"',
				},
				{
					regex: /â€“/g,
					// eslint-disable-next-line
					replacement: "\-\-",
				},
			];
			rules.forEach(function (rule) {
				text = text.replace(rule.regex, rule.replacement);
			});

			return text.trim();
		},
	},
	beforeRouteLeave(to, from, next) {
		if (this.unsaved_changes) {
			this.$snotify.error(
				"There are unsaved changes in the form.\n Would you like to continue?",
				"Unsaved Changes",
				{
					buttons: [
						{
							text: "Leave",
							action: (toast) => {
								next();
								this.$snotify.remove(toast.id);
							},
							bold: false,
						},
						{
							text: "Stay",
							action: (toast) => {
								next(false);
								this.$snotify.remove(toast.id);
							},
							bold: true,
						},
					],
				}
			);
		} else {
			next();
		}
	},
};
</script>

<style lang="scss" scoped>
.content {
	padding-bottom: 0;

	.spell-wrapper {
		display: grid;
		height: calc(100vh - 168px) !important;
		grid-template-rows: auto 60px;

		.form {
			overflow-x: hidden;
			overflow-y: scroll;

			&::-webkit-scrollbar {
				display: none;
			}
			.old_spell {
				position: -webkit-sticky;
				position: sticky;
				top: 0;
				.card-header a.selected {
					// font-weight: bold;
					color: white !important;
					cursor: default !important;
				}
			}
		}

		.save {
			display: flex;
			justify-content: space-between;
			padding: 10px 0;
			border-top: solid 1px $neutral-4;

			.unsaved_changes {
				padding: 10px;
				height: 38px;
				margin-right: 10px;
			}
		}
	}
}
</style>
