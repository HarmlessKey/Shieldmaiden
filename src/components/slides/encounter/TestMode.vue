<template>
	<div>
		<h2>Test Mode</h2>
		<p>
			In test mode you can freely perform any action in your encounter, without making changes to
			the actual encounter.
		</p>
		<p>
			The test encounter is basically a temporary copy of your encounter. It has a separate log and
			damage meters. Anything you apply to an entity (damage, healing, bonuses, conditions,
			reminders) is only applied in the copy.
		</p>
		<p>Test mode is an ideal way to test if your encounter is maybe too easy or too difficult.</p>
	</div>
</template>

<script>
export default {
	name: "TestMode",
};
</script>
