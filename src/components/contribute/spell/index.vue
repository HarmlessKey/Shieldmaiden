<template>
	<div>
		<Crumble :name="spell.name"/>
	
		<h1 class="spellTitle d-flex justify-content-between">
			{{ spell.name }}
			<span v-if="userInfo && userInfo.admin ">
				<a v-if="!edit" @click="setEdit(!edit)" v-b-tooltip.hover title="Edit" class="mx-2"><i class="fas fa-pencil-alt"></i></a>
				<a v-else @click="setEdit(false)" v-b-tooltip.hover title="Cancel" class="mx-2"><i class="fas fa-times"></i></a>
				<a @click="checked(!spell.checked)" :class="{'gray-hover': !spell.checked, 'green': spell.checked}"><i class="fas fa-check"></i> Item checked</a>
			</span>
		</h1>

		<template v-if="!edit">
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
		</template>

		<template v-else> 
			<SpellEdit :id="$route.params.id" />
		</template>
	</div>
</template>

<script>
	import { db_dev, db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import SpellEdit from '@/components/contribute/spell/edit.vue'
	import { mapGetters } from 'vuex'

	export default {
		name: 'Spell',
		components: {
			Crumble,
			SpellEdit,
		},
		props: ['id'],
		beforeMount() {
			//Because the component is loaded
			//in another view, the scroll needs to be reset to 0
			window.scrollTo(0,0);
		},
		data() {
			return {
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
			]),
		},
		firebase() {
			return {
				oldSpell: {
					source: db.ref(`spells/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
				spell: {
					source: db_dev.ref(`spells/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				}
			}
		},
		methods: {
			setEdit(value) {
				this.edit = value
			},
			checked(value) {
				db_dev.ref(`spells/${this.id}/checked`).set(value);
			}
		}
	}
</script>

<style lang="scss" scoped>
 .spellTitle {
		margin-bottom: 5px;

		i {
			font-size: 15px;
		}
 }
</style>