<template>
	<div class="content">
		<Crumble :name="(spell.changed) ? spell.name : old_spell.name"/>
		<h2 class="spellTitle d-flex justify-content-between" v-if="old_spell">
			{{ (spell.changed) ? spell.name : old_spell.name }}
		</h2>
		
		<div class="spell-wrapper" v-if="canEdit()">
			<template v-if="(old_spell && spell)">
				
				<q-form @submit="store_spell()" ref="spellFormRef" greedy>
					<div class="row q-col-gutter-md">
						<div class="col-12 col-md-4" id="old_spell">
							<hk-card header="Old Spell Description" v-if="loading">
								<div  class="loader"> <span>Loading old_spell...</span></div>
							</hk-card>
							<hk-card class="old_spell" v-else>
								
								<div class="card-header d-flex justify-content-between" slot="header">
									<a @click="preview('old')" :class="preview_spell=='old' ? 'selected' : ''">Old Spell Description</a>
									<a @click="preview('new')" :class="preview_spell=='new' ? 'selected' : ''">New Spell Description</a>
								</div>
								<div v-if="preview_spell == 'old'">
								<!-- <hk-card class="old_spell" header="Old Spell Description" v-else> -->
									<a 
										class="btn btn-block mb-3" 
										@click="parse_old_spell()">
											<i class="fas fa-wand-magic"></i>
											<span class="d-none d-md-inline ml-1">Parse to new spell</span>
									</a>

									<h1 class="spellTitle"><a v-if="old_spell.name" :href="`https://www.dndbeyond.com/spells/${toKebabCase(old_spell.name)}`" target="_blank" rel="noopener">{{ old_spell.name }}</a></h1>
									<i class="mb-3 d-block" v-if="old_spell.school">
										{{ spell_levels[old_spell.level] }}
										{{ old_spell.school.name }}
									</i>

									<p>
										<b>Casting time:</b> {{ old_spell.casting_time }}<br/>
										<b>Range:</b> {{ old_spell.range }}<br/>
										<b>Components:</b> 
										<template v-for="(component, index) in old_spell.components">
											{{ component }}<template v-if="Object.keys(old_spell.components).length > index + 1">, </template>
										</template>
										<template v-if="old_spell.material"> ({{ old_spell.material }})</template>
										<br/>
										<b>Duration:</b>
											<template v-if="old_spell.concentration == 'yes'"> Concentration, </template>
											{{ old_spell.duration }}<br/>
										<b>Classes:</b> 
										<template v-for="(_class, index) in old_spell.classes">
											{{ _class.name }}<template v-if="Object.keys(old_spell.classes).length > index + 1">, </template>
										</template>
										<br/>
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
								</div> <!-- card-body -->
								<!-- New spell preview active -->
								<div v-else>
									<ViewSpell :data="spell" :no_roll="true" />
								</div>
							</hk-card>
						</div>

						<div class="col-12 col-md-8">
							<EditSpell :spell="spell" />
						</div>
					</div>
					<div class="save">
						<div class="d-flex justify-content-start">
							<div v-if="unsaved_changes" class="bg-red white unsaved_changes">
								<i class="fas fa-exclamation-triangle"></i> There are unsaved changes in the spell
							</div>	
							<a v-if="unsaved_changes" class="btn bg-neutral-5" @click="cancel_changes()">Revert</a>
						</div>
						<div>
							<router-link :to="`/contribute/spells/${id}`" class="btn bg-neutral-5 mr-2">Cancel</router-link>
							<q-btn label="Save" no-caps type="submit" color="primary"/>
						</div>
					</div>
				</q-form>
			</template>
		</div>
	</div>
</template>

<script>
import { db } from '@/firebase';
import Crumble from '@/components/crumble/Compendium.vue';
import EditSpell from '@/components/contribute/spell/forms';
import ViewSpell from '@/components/ViewSpell.vue';
import { general } from '@/mixins/general';
import { spells } from '@/mixins/spells';
import { mapGetters } from 'vuex';

export default {
	name: 'ContribSpellEdit',
	components: {
		Crumble,
		ViewSpell,
		EditSpell,
	},
	mixins: [general, spells],
	metaInfo() {
		return {
			title: this.old_spell.name + ' | D&D 5th Edition',
			meta: [
				{ vmid: 'description', name: 'description', content: 'D&D 5th Edition Spell: ' + this.old_spell.name }
			]
		}
	},
	data() {
		return {
			userId: this.$store.getters.user.uid,
			id: this.$route.params.id,
			loading: true,
			
			validators: {},
			spell: {},
			unsaved_changes: false,
			fb_spell_json: {},
			preview_spell: 'old',
		}
	},
	computed: {
		...mapGetters([
			'tier',
			"userInfo"
		]),
	},
	firebase() {
		return {
			// spell: {
			// 	source: db.ref(`new_spells/${this.id}`),
			// 	asObject: true,
			// 	readyCallback: () => {
			// 		this.loading = false
			// 		this.fb_spell_json = JSON.stringify(this.spell);
			// 		this.unsaved_changes = false
			// 	}
			// },
			old_spell: {
				source: db.ref(`spells/${this.id}`),
				asObject: true,
				readyCallback: () => this.loading = false
			}
		}
	},
	mounted() {
		const spell_ref = db.ref(`new_spells/${this.id}`);
		spell_ref.once('value', (snapshot) => {
			console.log(snapshot.val());
			this.spell = snapshot.val();
			this.spell.components = {}
		})
	},
	methods: {
		canEdit() {
			return (this.old_spell.metadata && this.old_spell.metadata.tagged === this.userId) ||
				this.userInfo.admin;
		},
		preview(type) {
			this.preview_spell = type;
		},
		parse_old_spell() {
			// Parse values from old_spell object to new spell object

			// TODO:
			// Check if the parsed value is actually a valid value (e.g. available in dropdown)
			
			// Parse simple values
			this.spell.name = this.old_spell.name;
			this.spell.school = this.old_spell.school.name.toLowerCase();
			this.spell.ritual = (this.old_spell.ritual == 'yes') ? true : null;
			this.spell.level = (this.old_spell.level == -1) ? 0 : this.old_spell.level;
			this.spell.level_scaling = (this.old_spell.higher_level) ? undefined : "none";
			
			// Parse range options
			if (parseInt(this.old_spell.range)) {
				this.spell.range_type = "ranged";
				let range_list = this.old_spell.range.split(' ');
				let rangeN = parseInt(range_list[0]);
				// Parse miles to feet
				if (range_list[1].includes('mile')) {
					rangeN *= 5280;
				}
				this.spell.range = rangeN;
			} else {
				this.spell.range_type = this.old_spell.range.toLowerCase();
				delete this.spell.range;
			}

			// Parse casting time
			let cast_time = this.old_spell.casting_time.split(' ');
			this.spell.cast_time_nr = parseInt(cast_time[0]);
			let cast_type =  cast_time[1];

			if (cast_type[cast_type.length -1] == 's') {
				cast_type = cast_type.substring(0, cast_type.length - 1);
			}
			this.spell.cast_time_type = cast_type;
			delete this.spell.casting_time;

			// Parse components
			this.spell.components = [];
			for (let i in this.old_spell.components) {
				if (this.old_spell.components[i] == "V") {this.spell.components.push("verbal")}
				if (this.old_spell.components[i] == "S") {this.spell.components.push("somatic")}
				if (this.old_spell.components[i] == "M") {this.spell.components.push("material")}
			}
			if (this.old_spell.material) {
				this.spell.material_description = this.parse_spell_str(this.old_spell.material);
				delete this.spell.material;
			}

			// Parse duration
			// If a number in duration duration = concentration or time
			if (/\d/.test(this.old_spell.duration)) {
				let duration_list = this.old_spell.duration.split(' ');
				if (this.old_spell.concentration == 'yes') {
					this.spell.duration_type = "concentration";
					duration_list = duration_list.slice(2);
				} else {
					this.spell.duration_type = "time";
				}
				
				// Find duration time number and scale
				this.spell.duration_n = parseInt(duration_list[0]);
				// Calculate time scale
				let scale = duration_list[1];
				scale = scale.charAt(0).toUpperCase() + scale.substring(1);
				if (scale[scale.length -1] == 's') {
					scale = scale.substring(0, scale.length -1);
				}
				this.spell.duration_scale = scale.toLowerCase();

			} else {
				this.spell.duration_type = this.old_spell.duration.toLowerCase();
			}

			// Parse Description
			this.spell.description = "";
			for (let i in this.old_spell.desc) {
				if (i != 0)
					this.spell.description += "\n\n"; // Add white line before each paragraph after first
				this.spell.description += this.parse_spell_str(this.old_spell.desc[i]);
			}

			this.spell.higher_level = "";
			for (let i in this.old_spell.higher_level) {
				this.spell.higher_level += this.parse_spell_str(this.old_spell.higher_level[i]);
			}

			// Parse classes
			let classes = [];
			for (let index in this.old_spell.classes) {
				classes.push(this.old_spell.classes[index].name.toLowerCase());
			}
			this.spell.classes = classes;

			// Source book
			this.spell.source = this.old_spell.page;

			// Make spell responsive
			this.spell = Object.assign({}, this.spell);

			this.$nextTick(function(){
				this.$refs.spellFormRef.validate();
			})

		},
		parse_spell_str(text) {
			// map to replace weird character with real character 
			let rules = [
				{
					regex: /â€™/g,
					// eslint-disable-next-line
					replacement: '\'',
				},
				{
					regex: /â€”/g,
					// eslint-disable-next-line
					replacement: '\-\-',
				},
				{
					regex: /â€�/g,
					// eslint-disable-next-line
					replacement: '\"'
				},
				{
					regex: /â€œ/g,
					// eslint-disable-next-line
					replacement: '\"'
				},
				{
					regex: /â€“/g,
					// eslint-disable-next-line
					replacement: '\-\-'
				},
			];
			rules.forEach(function(rule) {
				text = text.replace(rule.regex, rule.replacement);
			});

			return text.trim();
		},
		update() {
			this.$forceUpdate();
		},
		// setValidators(validators) {
		// 	// Receives validator lists from basic info and spell actions
		// 	for (let v in validators) {
		// 		this.validators[v] = validators[v];
		// 	}
		// },
		// async validate_validators() {
		// 	// loops through all available validators to check if the forms
		// 	// are all valid. This happens async.
		// 	for (let v in this.validators) {
		// 		let validator = this.validators[v];
		// 		let temp = await validator.validateAll()
		// 		if (temp == false) return false;
		// 	}
		// 	return true;
		// },

		store_spell() {
			console.log("Store spell called")
			delete this.spell['.value'];
			delete this.spell['.key'];

			this.spell.changed = true;
			this.spell.checked = false;

			// Firebase can't be searched without case sensitivity
			this.spell.name = this.spell.name.toLowerCase();

			if(this.spell.cast_time_nr) {
				parseInt(this.spell.cast_time_nr);
			}
			if(this.spell.duration_n) {
				parseInt(this.spell.duration_n);
			}

			console.log(this.spell)
			
			// if (await this.validate_validators() === true) {
			// 	db.ref(`new_spells/${this.id}`).set(this.spell);
			// 	this.$snotify.success('Spell Saved.', 'Critical hit!', {
			// 		position: "rightTop"
			// 	});
			// 	this.validators = {};
			// 	this.unsaved_changes = false;
			// 	this.fb_spell_json = JSON.stringify(this.spell);
			// } else {
			// 	this.$snotify.error('Form Not Valid', 'Critical miss!', {
			// 		position: "rightTop"
			// 	});
			// }
			console.log(this.$ref.spellFormRef.submit())
		},
		cancel_changes() {
			this.spell = JSON.parse(this.fb_spell_json);
			this.unsaved_changes = false;
		}
	},
	watch: {
		spell: {
			deep: true,
			handler() {
				// Emits validation on every change
				if (JSON.stringify(this.spell) !== this.fb_spell_json)
					this.unsaved_changes = true;
				else
					this.unsaved_changes = false;
			},
		}
	},
	beforeRouteLeave (to, from, next) {
		if (this.unsaved_changes) {
			this.$snotify.error('There are unsaved changes in the form.\n Would you like to continue?', 'Unsaved Changes', {
				buttons: [
				{ text: 'Leave', action: (toast) => { next(); this.$snotify.remove(toast.id); }, bold: false},
				{ text: 'Stay', action: (toast) => { next(false); this.$snotify.remove(toast.id); }, bold: true},
				]
			});
		} else {
			next()
		}
	}
}
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