<template>
	<div class="pb-5">
		<h2>Description fields</h2>

		<h3>Markdown</h3>
		<p>The description field allows markdown</p>

		<table class="table">
			<thead>
				<th>
					Markdown info
				</th>
			</thead>
			<tbody>
				<tr v-for="(markdown, index) in markdownInfo" :key="`markdown-${index}`">
					<td v-html="markdown"/>
				</tr>
			</tbody>
		</table>

		<h3>Character stats</h3>
		<p>
			You can add stats of your character into the description. 
			Simply enter the reference of the desired stat, as shown in the tables below, into the description field. 
			The actual value will be shown when the description is displayed. The brackets are required.
		</p>
		
		<table class="table">
			<thead>
				<th>
					Ability scores
				</th>
				<th>
					Reference
				</th>
			</thead>
			<tbody>
				<tr v-for="({stat, ref}, index) in ability_scores" :key="`ability-${index}`">
					<td>{{ stat }}</td>
					<td>{{ ref }}</td>
				</tr>
			</tbody>
		</table>

		<table class="table">
			<thead>
				<th>
					Ability modifiers
				</th>
				<th>
					Reference
				</th>
			</thead>
			<tbody>
				<tr v-for="({stat, ref}, index) in ability_mods" :key="`mod-${index}`">
					<td>{{ stat }}</td>
					<td>{{ ref }}</td>
				</tr>
			</tbody>
		</table>

		<table class="table">
			<thead>
				<th>
					Character
				</th>
				<th>
					Reference
				</th>
			</thead>
			<tbody>
				<tr v-for="({stat, ref}, index) in character" :key="`character-${index}`">
					<td>{{ stat }}</td>
					<td>{{ ref }}</td>
				</tr>
			</tbody>
		</table>

		<table class="table">
			<thead>
				<th>
					Class
				</th>
				<th>
					Reference
				</th>
			</thead>
			<tbody>
				<tr v-for="({stat, ref}, index) in Class" :key="`class-${index}`">
					<td>{{ stat }}</td>
					<td>{{ ref }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	export default {
		name: 'Descriptions',
		data() {
			return {
				markdownInfo: [
						"*Italic*",
						"**Bold**",
						"__Underline__",
						"- Unordered list item",
						"1. Ordered list item",
						"Tables:<br/>"+
						"| header | header |<br/>"+
						"| ----------- | ----------- |<br/>"+
						"| column | column |<br/>"
				],
				ability_scores: [
					{
						stat: "Strength",
						ref: "[str]"
					},
					{
						stat: "Dexterity",
						ref: "[dex]"
					},
					{
						stat: "Constitution",
						ref: "[con]"
					},
					{
						stat: "Intelligence",
						ref: "[int]"
					},
					{
						stat: "Wisdom",
						ref: "[wis]"
					},
					{
						stat: "Charisma",
						ref: "[cha]"
					},
				],
				ability_mods: [
					{
						stat: "Strength mod",
						ref: "[str_mod]"
					},
					{
						stat: "Dexterity mod",
						ref: "[dex_mod]"
					},
					{
						stat: "Constitution mod",
						ref: "[con_mod]"
					},
					{
						stat: "Intelligence mod",
						ref: "[int_mod]"
					},
					{
						stat: "Wisdom mod",
						ref: "[wis_mod]"
					},
					{
						stat: "Charisma mod",
						ref: "[cha_mod]"
					},
				],
				character: [
					{
						stat: "Proficiency bonus",
						ref: "[proficiency]"
					},
					{
						stat: "Character level",
						ref: "[character_level]"
					}
				],
				Class: [
					{
						stat: "Class level",
						ref: "[class_level]"
					},
					{
						stat: "Spell attack mod",
						ref: "[spell_attack]"
					},
					{
						stat: "Spell save DC",
						ref: "[spell_save_dc]"
					}
				],
			}
		}
	};
</script>

<style scoped>

</style>
