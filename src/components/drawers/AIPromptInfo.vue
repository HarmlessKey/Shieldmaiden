<template>
	<div>
		<h2 class="mb-1">Using our AI Monster Generator</h2>
		<em>You can't spell Shieldmaiden without AI</em>
		<p class="mt-3">
			Our AI monster generator will generate monsters from any description you provide.<br />
			You can either provide a short descriptive prompt and let the AI go wild, or you can give
			extensive details and be in more control on what kind of monster you get back.
		</p>
		<p>
			The generated monster is injected in to our NPC creation form, allowing you to make changes if
			you wish.
		</p>

		<h3>Example prompts</h3>
		<div class="d-flex flex-col gap-2">
			<em>A Knight</em>
			<em>The rabbit from Monty Python and the Holy Grail</em>
			<em>A boss encounter with an evil wizard for a party with 4 players of level 6</em>
			<em>
				A monster suitable for a hard encounter for a party with 6 players of level 3, battling 5 of
				these monsters. The monster should be at home in a forest
			</em>
			<em>A goblin with 2 heads that are constantly in conflict</em>
		</div>
	</div>
</template>

<script>
export default {
	name: "AIPromptInfo",
	data() {
		return {};
	},
	methods: {},
};
</script>

<style lang="scss"></style>
