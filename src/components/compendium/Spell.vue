<template>
	<tag :is="cardView ? 'hk-card' : 'div'">
		<template v-if="spell">
			<div slot="header" :class="{ 'card-header': cardView }">
				<h1 class="spellTitle" v-if="title">{{ spell.name }}</h1>
			</div>
			<div :class="{ 'card-body': cardView }">
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
		</template>
		<hk-loader v-else name="Loading spell" />
	</tag>
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
			},
			cardView: {
				type: Boolean,
				default: false
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
			]),
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