<template>
	<ToolsPage title="Spell Creator" bg_img="spells-tool-header.png">
		<template v-slot:action_btn="{ btn_classes }">
			<q-btn
				color="primary"
				:class="btn_classes"
				no-caps
				push
				to="/tools/spell-creator/create-spell"
			>
				Create custom spell
			</q-btn>
		</template>

		<section class="mt-5">
			<p>
				Our spell creator lets you create custom spells with actions that can be rolled with one
				click.
			</p>
		</section>

		<section class="mt-5">
			<h2>Scaling</h2>
			<p>
				The actions of your spell change depending on caster level, or at what level the spell is
				casted.
			</p>
		</section>

		<section class="mt-5">
			<h2>Spellcasting monsters</h2>
			<p>
				You can combine your custom spells with the monsters you've made in Harmless Key to create
				powerful spellcasters that are easy to use in our
				<router-link to="/tools/combat-tracker">combat tracker</router-link>.
			</p>
		</section>

		<section class="mt-5">
			<h2>Share your creations</h2>
			<p>
				Our spell creator also makes it easy to share your custom spells with other dungeon masters
				and players. You can save your spells to your library if you have an account, export them to
				share with others, or import spells created by other Harmless Key users.<br />
				If you're a content creator you can provide your followers with spells that they can
				directly use in Harmless Key.
			</p>
		</section>
	</ToolsPage>
</template>

<script>
import ToolsPage from "src/components/ToolsPage.vue";

export default {
	name: "ToolsSpellCreator",
	components: {
		ToolsPage,
	},
	data() {
		return {};
	},
	methods: {},
};
</script>
