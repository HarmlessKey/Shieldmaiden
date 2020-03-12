<template>
	<div>
		<template v-if="(old_spell && spell)">
			
			<!-- <Crumble :name="old_spell.name"/> -->

			<b-row>
				<b-col md="4" id="old_spell">
					<b-card header="Old Spell Description" v-if="loading">
						<div  class="loader"> <span>Loading old_spell....</span></div>
					</b-card>
					<b-card class="old_spell" header="Old Spell Description" v-else>
						<h1 class="spellTitle">{{ old_spell.name }}</h1>
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
				</b-col> <!-- Old spell -->

				<b-col md="8" id="new_spell">
					<div>
						<a 
						class="gray-hover text-capitalize mx-3" :class="spell.changed ? 'red': 'blue' " 
						v-b-tooltip.hover title="Parse Old Spell" 
						@click="parse_old_spell()">
							<i class="fad fa-wand-magic"></i>
							<span class="d-none d-md-inline ml-1">{{ spell.changed ? 'Reset' : 'Parse' }}</span>
						</a>
						<a 
						class="gray-hover text-capitalize mx-3" 
						v-b-tooltip.hover title="Save Spell" 
						@click="store_spell()">
							<i class="fad fa-treasure-chest green"></i>
							<span class="d-none d-md-inline ml-1 green">Save</span>
						</a>
					</div>
					<basic-info v-model='spell' :levels='levels'/>
					<!-- SPELL ACTIONS -->
					<spell-actions v-model='spell' />
				</b-col>
			</b-row>
		</template>
	<!-- <style src="vue-multiselect/dist/vue-multiselect.min.css"></style> -->
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import basicInfo from '@/components/contribute/spell/forms/basic-info.vue'
	import spellActions from '@/components/contribute/spell/forms/spell-actions.vue'
	import { mapGetters } from 'vuex'

	export default {
		name: 'SpellEdit',
		components: {
			Crumble,
			basicInfo,
			spellActions,
		},
		props: ['id'],
		metaInfo() {
			return {
				title: this.old_spell.name + ' | D&D 5th Edition',
				meta: [
          { vmid: 'description', name: 'description', content: 'D&D 5th Edition Spell: ' + this.old_spell.name }
        ]
			}
		},
		beforeMount() {
			//Because the component is loaded
			//in another view, the scroll needs to be reset to 0
			window.scrollTo(0,0);
		},
		data() {
			return {
				loading: true,
				levels: ["Cantrip",
					"1st","2nd","3rd",
					"4th","5th","6th",
					"7th","8th","9th"],
			}
		},
		computed: {
			...mapGetters([
				'tier',
			]),
		},
		mounted() {
			this.$nextTick(function() {
				if ($('ins').length > 0) {
					(adsbygoogle = window.adsbygoogle || []).push({});
				}
			})
		},
		firebase() {
			return {
				spell: {
					source: db.ref(`new_spells/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
				old_spell: {
					source: db.ref(`spells/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				}
			}
		},
		methods: {
			parse_old_spell() {
				console.log(old_spell);
				// Parse values from old_spell object to new spell object
				// console.log(this.old_spell)
				// console.log(this.spell)
				
				// Parse simple values
				// this.$set(this.spell, 'name', this.old_spell.name);
				// this.spell.name = this.old_spell.name;
				this.spell.school = this.old_spell.school.name;
				this.spell.ritual = (this.old_spell.ritual == 'yes') ? true : false;
				this.spell.level = (this.old_spell.level == -1) ? 0 : this.old_spell.level;
				this.spell.level_scaling = (this.old_spell.higher_level) ? "undefined" : "None";
				
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
				let cast_type =  cast_time.slice(1)
							 									  .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
							 									  .join(' ');
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
				// console.log(this.old_spell)
				for (let i in this.old_spell.desc) {
					// console.log((i))
					// console.log((i !== '0'))
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

				this.store_spell();

				// Clean up spell object
				// delete this.spell.concentration
				// delete this.spell.duration
				// delete this.spell.higher_level
			},
			parse_spell_str(old_string) {
				// map to replace weird character with real character 
				let replace_map = [
					[/â€™/g, '\''],
					[/â€�/g, '\"'],
					[/â€œ/g, '\"'],
				];
				for (let i in replace_map){
					old_string = old_string.replace(...replace_map[i]);
				}
				return old_string;
			},
			update() {
				this.$forceUpdate();
			},
			store_spell() {
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

				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`new_spells/${this.id}`).set(this.spell);
						console.log("Validated");
						// this.$router.replace('/players')
					} else {
						console.log("Not validated");
					}
				})
			},
			
		}
	}
</script>

<!-- <style src="vue-multiselect/dist/vue-multiselect.min.css"></style> -->

<style lang="scss" scoped>
	// @import "vue-multiselect/dist/vue-multiselect.min.css";

 .spellTitle {
		margin-bottom: 5px;
 }
 .url {
	display: block;
	margin-bottom: 15px;
	word-break: break-all;
}
label {
	margin-top: 0.5rem;
	margin-bottom: 0;
}

.class_box {
	padding: 0 6px;
	background: #000;
	width: 40px;
	text-align: center;
	line-height: 36px;
	height: 36px;
	font-size: 18px;
	span {
		color: white;
	}
}

select#classes {
	height: 158px;
}

.component_box {
	background: #000;
	width: 40px;
	text-align: center;
	line-height: 36px;
	height: 36px;
	font-size: 18px;
	span {
		color: white;
	}
}
.component_box.selected {
	background: #2c97de;
}

.old_spell {
	position: -webkit-sticky;
	position: sticky;
	top: 60px;
}

.collapse-header {
	display: grid;
	grid-template-columns: auto 20px;
}

.remove-link a {
	display: block;
  height: 100%;
  line-height: 60px;
  padding-bottom: 15px;

  i {
  	vertical-align: bottom;
  }
}

</style>