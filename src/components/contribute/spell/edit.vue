<template>
	<div class="content">
		<Crumble :name="(spell.changed) ? spell.name : old_spell.name"/>
		<h2 class="spellTitle d-flex justify-content-between" v-if="old_spell">
			{{ (spell.changed) ? spell.name : old_spell.name }}
		</h2>
		
		<div class="spell-wrapper" v-if="canEdit()">
			<template v-if="(old_spell && spell)">
				
				<div class="form">
					<b-row>
						<b-col md="4" id="old_spell">
							<b-card header="Old Spell Description" v-if="loading">
								<div  class="loader"> <span>Loading old_spell...</span></div>
							</b-card>
							<b-card class="old_spell" header="Old Spell Description" v-else>
								<a 
									class="btn btn-block mb-3" 
									@click="parse_old_spell()">
										<i class="fas fa-wand-magic"></i>
										<span class="d-none d-md-inline ml-1">Parse to new spell</span>
								</a>

								<h1 class="spellTitle"><a v-if="old_spell.name" :href="`https://www.dndbeyond.com/spells/${toKebabCase(old_spell.name)}`" target="_blank">{{ old_spell.name }}</a></h1>
								<i class="mb-3 d-block" v-if="old_spell.school">
									{{ levels[old_spell.level] }}
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
							</b-card>
						</b-col>

					<b-col md="8">
						<basic-info v-model='spell' :levels='levels' @validation="setValidators" />
						<!-- SPELL ACTIONS -->
						<spell-actions v-model='spell' @validation="setValidators" />
					</b-col>
				</b-row>
			</div>
			<div class="save">
				<div class="d-flex justify-content-start">
					<div v-if="unsaved_changes" class="bg-red white unsaved_changes">
					 <i class="fas fa-exclamation-triangle"></i> There are unsaved changes in the spell
					</div>	
					<a v-if="unsaved_changes" class="btn bg-gray" @click="cancel_changes()">Revert</a>
				</div>
				<div>
					<router-link :to="`/contribute/spells/${id}`" class="btn bg-gray mr-2">Cancel</router-link>
					<button 
						:disabled="errors.items && errors.items.length > 0"
						class="btn" 
						@click="store_spell()"
					>
						<i class="fas fa-check"></i> Save
					</button>
				</div>
			</div>
			</template>
		</div>
	</div>
</template>

<script>
import { db } from '@/firebase'
import Crumble from '@/components/crumble/Compendium.vue'
import basicInfo from '@/components/contribute/spell/forms/basic-info.vue'
import spellActions from '@/components/contribute/spell/forms/spell-actions.vue'
import { general } from '@/mixins/general.js'
import { mapGetters } from 'vuex'

export default {
	name: 'SpellEdit',
	components: {
		Crumble,
		basicInfo,
		spellActions,
	},
	mixins: [general],
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
			userId: this.$store.getters.getUser.uid,
			id: this.$route.params.id,
			loading: true,
			levels: ["Cantrip",
				"1st","2nd","3rd",
				"4th","5th","6th",
				"7th","8th","9th"],
			validators: {},
			spell: {},
			unsaved_changes: false,
			fb_spell_json: {}
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
			spell: {
				source: db.ref(`new_spells/${this.id}`),
				asObject: true,
				readyCallback: () => {
					this.loading = false
					this.fb_spell_json = JSON.stringify(this.spell);
					this.unsaved_changes = false
				}
			},
			old_spell: {
				source: db.ref(`spells/${this.id}`),
				asObject: true,
				readyCallback: () => this.loading = false
			}
		}
	},
	methods: {
		canEdit() {
			return (this.old_spell.metadata && this.old_spell.metadata.tagged === this.userId) ||
				this.userInfo.admin;
		},
		parse_old_spell() {
			// Parse values from old_spell object to new spell object

			// TODO:
			// Check if the parsed value is actually a valid value (e.g. available in dropdown)
			
			// Parse simple values
			// this.$set(this.spell, 'name', this.old_spell.name);
			this.spell.name = this.old_spell.name;
			this.spell.school = this.old_spell.school.name.toLowerCase();
			this.spell.ritual = (this.old_spell.ritual == 'yes') ? true : false;
			this.spell.level = (this.old_spell.level == -1) ? 0 : this.old_spell.level;
			this.spell.level_scaling = (this.old_spell.higher_level) ? undefined : "None";
			
			// Parse range options
			if (parseInt(this.old_spell.range)) {
				this.spell.range_type = "Ranged";
				let range_list = this.old_spell.range.split(' ');
				let rangeN = parseInt(range_list[0]);
				// Parse miles to feet
				if (range_list[1].includes('mile')) {
					rangeN *= 5280;
				}
				this.spell.range = rangeN;
			} else {
				this.spell.range_type = this.old_spell.range;
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
			this.spell.components = {'verbal': false,'somatic': false ,'material': false};
			for (let i in this.old_spell.components) {
				if (this.old_spell.components[i] == "V") {this.spell.components.verbal = true}
				if (this.old_spell.components[i] == "S") {this.spell.components.somatic = true}
				if (this.old_spell.components[i] == "M") {this.spell.components.material = true}
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
					this.spell.duration_type = "Concentration";
					duration_list = duration_list.slice(2);
				} else {
					this.spell.duration_type = "Time";
				}
				
				// Find duration time number and scale
				this.spell.duration_n = parseInt(duration_list[0]);
				// Calculate time scale
				let scale = duration_list[1];
				scale = scale.charAt(0).toUpperCase() + scale.substring(1);
				if (scale[scale.length -1] == 's') {
					scale = scale.substring(0, scale.length -1);
				}
				this.spell.duration_scale = scale;

			} else {
				let duration_list = this.old_spell.duration.split(' ');
				this.spell.duration_type = duration_list.map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
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
				classes.push(this.old_spell.classes[index].name);
			}
			this.spell.classes = classes;

			// Source book
			this.spell.source = this.old_spell.page;

			// Make spell responsive
			this.spell = Object.assign({}, this.spell);

		},
		parse_spell_str(text) {
			// map to replace weird character with real character 
			let rules = [
				{
					regex: /â€™/g,
					replacement: '\'',
				},
				{
					regex: /â€�/g,
					replacement: '\"'
				},
				{
					regex: /â€œ/g,
					replacement: '\"'
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
		setValidators(validators) {
			console.log("set validators")
			// Receives validator lists from basic info and spell actions
			for (let v in validators) {
				this.validators[v] = validators[v];
				// this.validators.push(validator)
			}
			// this.spell = Object.assign({}, this.spell);
			// this.validation = validate;
		},
		async validate_validators() {
			// loops through all available validators to check if the forms
			// are all valid. This happens async.
			for (let v in this.validators) {
				let validator = this.validators[v];
				 let temp = await validator.validateAll()
				 if (temp == false)
				 	return false;
			}
			return true;
		},

		async store_spell() {
			delete this.spell['.value'];
			delete this.spell['.key'];

			this.spell.changed = true;
			this.spell.checked = false;

			if(this.spell.cast_time_nr) {
				parseInt(this.spell.cast_time_nr);
			}
			if(this.spell.duration_n) {
				parseInt(this.spell.duration_n);
			}

			
			if (await this.validate_validators() === true) {
			// this.validation.validateAll().then((result) => {
				// if (result) {
				console.log("Validated");
				db.ref(`new_spells/${this.id}`).set(this.spell);
				this.$snotify.success('Spell Saved.', 'Critical hit!', {
					position: "rightTop"
				});
				this.validators = {};
				this.unsaved_changes = false;
				this.fb_spell_json = JSON.stringify(this.spell);
				// this.$router.replace('/players')
			} else {
				console.log("Not validated");
				this.$snotify.error('Form Not Valid', 'Critical miss!', {
					position: "rightTop"
				});
			}
			// })
		},
		cancel_changes() {
			this.spell = JSON.parse(this.fb_spell_json);
			this.unsaved_changes = false;
		}
	},
	watch: {
		spell: {
			// immediate: true,
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
			}
		}
	
		.save {
			display: flex;
			justify-content: space-between;
			padding: 10px 0;
			border-top: solid 1px #5c5757;
	
			.unsaved_changes {
				padding: 10px;
				height: 38px;
				margin-right: 10px;
			}
		}
	}
}

</style>