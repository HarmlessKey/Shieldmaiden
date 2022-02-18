<template>
	<div class="content">
		<Crumble :name="(spell.changed) ? spell.name : oldSpell.name"/>
		<h2 class="spellTitle d-flex justify-content-between" v-if="oldSpell">
			{{ (spell.changed) ? spell.name : oldSpell.name }}
			<span v-if="canEdit()">
				<router-link :to="'/contribute/spells/' + spellId + '/edit'" class="mx-2">
					<i class="fas fa-pencil-alt"></i>
					<q-tooltip anchor="center right" self="center left">
						Edit
					</q-tooltip>
				</router-link>
				<!-- <a v-if="userInfo.admin" @click="checked(!spell.checked)" :class="{'neutral-2': !spell.checked, 'green': spell.checked}"><i class="fas fa-check"></i> Item checked</a> -->
			</span>
		</h2>

			<!-- SHOW THE OLD SPELL IF SPELL IS NOT CHANGED YET -->
			<template v-if="oldSpell.school && !spell.changed">
				<i class="mb-3 d-block">
					{{ levels[oldSpell.level] }}
					{{ oldSpell.school.name }}
				</i>

				<p>
					<b>Casting time:</b> {{ oldSpell.casting_time }}<br/>
					<b>Range:</b> {{ oldSpell.range }}<br/>
					<b>Components:</b> 
					<template v-for="(component, index) in oldSpell.components">
						{{ component }}<template v-if="Object.keys(oldSpell.components).length > index + 1">, </template>
					</template>
					<template v-if="oldSpell.material"> ({{ oldSpell.material }})</template>
					<br/>
					<b>Duration:</b>
						<template v-if="oldSpell.concentration == 'yes'"> Concentration, </template>
						{{ oldSpell.duration }}<br/>
					<b>Classes:</b> 
					<template v-for="(_class, index) in oldSpell.classes">
						{{ _class.name }}<template v-if="Object.keys(oldSpell.classes).length > index + 1">, </template>
					</template>
					<br/>
				</p>
				<p v-for="(desc, index) in oldSpell.desc" :key="index">
					{{ desc }}
				</p>

				<p v-if="oldSpell.higher_level">
					At higher levels. 
					<template v-for="higher in oldSpell.higher_level">
						{{ higher }}
					</template>
				</p>
			</template>
			<template v-else-if="spell && spell.changed">
				<!-- {{ spell }} -->
				<i class="mb-3 d-block">
					{{ levels[spell.level] }}
					{{ spell.school }}
				</i>

				<p>
					<b>Casting time:</b> {{ spell.cast_time_nr }} {{spell.cast_time_type}}<br/>
					<b>Range:</b> {{ (spell.range_type == "Ranged") ? spell.range + " feet" : spell.range_type}}<br/>
					<b>Components:</b> 
					<template v-for="(val, component) in spell.components">
						{{ val ? component.charAt(0).toUpperCase() : ""}}
					</template>
					<template v-if="spell.material_desciption"> ({{ spell.material_desciption }})</template>
					<br/>
					<b>Duration:</b> {{ spell.duration_type }}<br>
					<b>Classes:</b> 
					<template v-for="(_class, index) in spell.classes">
						{{ _class }}<template v-if="Object.keys(spell.classes).length > index + 1">, </template>
					</template>
					<br/>
				</p>
				<p>
					<vue-markdown name="description" :source="spell.description"></vue-markdown>
				</p>
			</template>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import SpellEdit from '@/components/contribute/spell/edit.vue'
	import { mapGetters } from 'vuex'
	import VueMarkdown from 'vue-markdown'

	export default {
		name: 'Spell',
		components: {
			Crumble,
			SpellEdit,
			VueMarkdown,
		},
		props: ['id'],
		data() {
			return {
				userId: this.$store.getters.user.uid,
				spellId: this.$route.params.id,
				edit: false,
				loading: true,
				levels: {
					'-1': 'Cantrip',
					0: 'Cantrip',
					1: '1st level',
					2: '2nd level',
					3: '3rd level',
					4: '4th level',
					5: '5th level',
					6: '6th level',
					7: '7th level',
					8: '8th level',
					9: '9th level',
				},
			}
		},
		computed: {
			...mapGetters([
				'userInfo'
			])
		},
		filters: {
			capitalize: function (value) {
				if (!value) return ''
				value = value.toString()
				return value.charAt(0).toUpperCase() + value.slice(1)
			}
		},
		firebase() {
			return {
				oldSpell: {
					source: db.ref(`spells/${this.spellId}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
				spell: {
					source: db.ref(`new_spells/${this.spellId}`),
					asObject: true,
					readyCallback: () => this.loading = false
				}
			}
		},
		methods: {
			canEdit() {
				return (this.spell.metadata && this.spell.metadata.tagged === this.userId) ||
					this.userInfo.admin;
			},
			setEdit(value) {
				this.edit = value
			},
			checked(value) {
				db.ref(`new_spells/${this.id}/checked`).set(value);
			}
		},
	}
</script>

<style lang="scss" scoped>
 .spellTitle {
		font-size: 18px !important;
		text-transform: none !important;
		border-bottom: solid 1px $neutral-4;
		padding-bottom: 5px;
		margin-bottom: 5px;

		i {
			font-size: 15px;
		}
 }
</style>