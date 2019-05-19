<template>
	<div>
		
		<template v-if="false">
			
			<div v-if="loading" class="loader"> <span>Loading spell....</span></div>

			<h1 class="spellTitle">{{ spell.name }}</h1>
			<i class="mb-3 d-block">
				{{ levels[spell.level] }}
				{{ spell.school.name }}
			</i>

			<p>
				<b>Casting time:</b> {{ spell.casting_time }}<br/>
				<b>Range:</b> {{ spell.range }}<br/>
				<b>Components:</b> 
				<template v-for="(component, index) in spell.components">
					{{ component }}<template v-if="Object.keys(spell.components).length > index + 1">, </template>
				</template>
				<template v-if="spell.material"> ({{ spell.material }})</template>
				<br/>
				<b>Duration:</b>
					<template v-if="spell.concentration == 'yes'"> Concentration, </template>
					{{ spell.duration }}<br/>
				<b>Classes:</b> 
				<template v-for="(_class, index) in spell.classes">
					{{ _class.name }}<template v-if="Object.keys(spell.classes).length > index + 1">, </template>
				</template>
				<br/>
			</p>
			<p v-for="(desc, index) in spell.desc" :key="index">
				{{ desc }}
			</p>

			<p v-if="spell.higher_level">
				At higher levels. 
				<template v-for="higher in spell.higher_level">
					{{ higher }}
				</template>
			</p>
		</template>
		<template v-else>
			<SpellEdit :id="$route.params.id" />
		</template>
	</div>
</template>

<script>
	import { db_dev } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import { mapGetters } from 'vuex'
	import SpellEdit from '@/components/contribute/spell/edit.vue'

	export default {
		name: 'Spell',
		components: {
			Crumble,
			SpellEdit,
		},
		props: ['id'],
		metaInfo() {
			return {
				title: this.spell.name + ' | D&D 5th Edition',
				meta: [
          { vmid: 'description', name: 'description', content: 'D&D 5th Edition Spell: ' + this.spell.name }
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
					source: db_dev.ref(`spells/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				}
			}
		},
		methods: {
		}
	}
</script>

<style lang="scss" scoped>
 .spellTitle {
		margin-bottom: 5px;
 }
 .url {
	display: block;
	margin-bottom: 15px;
	word-break: break-all;
}
</style>