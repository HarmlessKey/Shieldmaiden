<template>
	<div v-if="!loading">
		<h2 class="mb-1">{{ spell.name }}</h2>
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
		<hk-dice-text 
			v-for="(desc, index) in spell.desc" 
			:input_text="parse_spell_str(desc)" 
			:key="index"
		/>

		<p v-if="spell.higher_level">
			At higher levels. 
			<template v-for="higher in spell.higher_level">
				{{ parse_spell_str(higher) }}
			</template>
		</p>
	</div>
	<hk-loader v-else name="spell" />
</template>

<script>
	import { mapActions } from "vuex";

	export default {
		name: "Spell",
		props: {
			// If the spell is fetched in a parent component you can send the full spell object in de data prop
			data: {
				type: Object
			},
			// If the id prop is passed, the spell is fetched in the Spell component
			id: {
				type: String
			}
		},
		data() {
			return {
				spell: {},
				loading: true
			}
		},
		async beforeMount() {
			if(this.data) {
				this.spell = this.data;		
				this.loading = false;
			} else {
				this.spell = await this.get_api_spell(this.id);
				this.loading = false;
			}			
		},
		methods: {
			...mapActions("api_spells", ["get_api_spell"]),
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
		}
	};
</script>

<style lang="scss" scoped>
	
</style>
