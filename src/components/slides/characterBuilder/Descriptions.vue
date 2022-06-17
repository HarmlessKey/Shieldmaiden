<template>
	<div class="pb-5">
		<h2>Description fields</h2>

		<h3>Markdown guide</h3>

		<hk-card v-for="(info, key) in markdownInfo" :key="key" small :header="info.header">
			<div class="card-body">
				<pre v-html="info.content" />
			</div>
		</hk-card>

		<h3>Character stats</h3>
		<p>
			You can add stats of your character into the description. 
			Simply enter the reference of the desired stat (as shown in the tables below) into the description field. 
			The actual value will be shown when the description is displayed. The brackets are required.
		</p>
		
		<hk-card header="Ability scores" small>
			<table class="table mb-0">
				<thead>
					<th>
						Ability
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
		</hk-card>

		<hk-card header="Ability modifiers" small>
			<table class="table mb-0">
				<thead>
					<th>
						Ability
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
		</hk-card>

		<hk-card header="Character values" small>
			<table class="table mb-0">
				<thead>
					<th>
						Value
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
		</hk-card>

		<hk-card header="Class values" small>
			<table class="table mb-0">
				<thead>
					<th>
						Value
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
		</hk-card>
	</div>
</template>

<script>
	export default {
		name: 'Descriptions',
		data() {
			return {
				markdownInfo: {
					emphasis: {
						header: "Emphasis",
						content: "**<strong>Bold</strong>**\n"+
							"*<em>Italic</em>*\n"+
							"__<u>Underline</u>__\n"+
							"~~<s>Strikethrough</s>~~"
					},
					headers: {
						header: "Headers",
						content: "# Big header\n"+
							"## Medium header\n"+
							"### Small header\n"+
							"#### Tiny header\n"
					},
					lists: {
						header: "Lists",
						content: "* Unordered list item\n"+
						"* Unordered list item\n"+
						"* Unordered list item\n\n"+
						"1. Ordered list item\n"+
						"2. Ordered list item\n"+
						"3. Ordered list item"
					},
					tables: {
						header: "Tables",
						content: "| Column 1 | Column 2 | Column 3 |\n"+
							"| -------- | -------- | -------- |\n"+
							"| 5th      | Human    | Rogue    |\n"+
							"| 8th      | Dwarf    | Cleric   |\n\n"+
							"Column alignment is not required\n\n"+
							"| Column 1 | Column 2 | Column 3 |\n"+
							"| - | - | - |\n"+
							"| 5th | Human | Rogue |\n"+
							"| 8th | Dwarf | Cleric |"
					}
				},
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
						stat: "Strength",
						ref: "[str_mod]"
					},
					{
						stat: "Dexterity",
						ref: "[dex_mod]"
					},
					{
						stat: "Constitution",
						ref: "[con_mod]"
					},
					{
						stat: "Intelligence",
						ref: "[int_mod]"
					},
					{
						stat: "Wisdom",
						ref: "[wis_mod]"
					},
					{
						stat: "Charisma",
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