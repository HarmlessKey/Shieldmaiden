<template>
	<div v-if="spell">
		<h1 class="spellTitle" v-if="title">{{ spell.name }}</h1>
		<i class="mb-3 d-block">
			<template v-if="spell.level > 0">
				{{ spell. level | numeral("oO") }} level
			</template>
			<template v-else>Cantrip</template>
			<span v-if="spell.school"> {{ spell.school.name }}</span>
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
			<template v-if="spell.classes">
				<b>Classes:</b> 
				<template v-for="(_class, index) in spell.classes">
					{{ _class.name }}<template v-if="Object.keys(spell.classes).length > index + 1">, </template>
				</template>
				<br/>
			</template>
		</p>
		<hk-dice-text v-for="(desc, index) in spell.desc" :input_text="desc" :key="index"/>

		<p v-if="spell.higher_level">
			At higher levels. 
			<template v-for="higher in spell.higher_level">
				{{ higher }}
			</template>
		</p>
	</div>
	<hk-loader v-else name="Loading spell" />
</template>

<script>
	import { mapGetters, mapActions } from "vuex";

	export default {
		name: "Spell",
		props: {
			id: {
				type: String,
				required: true
			},
			title: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
			}
		},
		computed: {
			...mapGetters([
				"get_spell",
				"spells"
			]),
			spell() {
				return this.get_spell(this.id);
			}
		},
		beforeMount() {
			if(!this.spells[this.id]) {
				this.set_spell(this.id);
			}
		},
		methods: {
			...mapActions([
				"set_spell"
			])
		}
	}
</script>

<style lang="scss" scoped>
 .spellTitle {
		font-size: 18px;
		margin-bottom: 5px;
 }
 .url {
	display: block;
	margin-bottom: 15px;
	word-break: break-all;
}
</style>