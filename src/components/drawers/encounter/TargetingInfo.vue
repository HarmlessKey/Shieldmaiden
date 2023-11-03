<template>
	<div>
		<h2>Targeting</h2>
		<p>Select at least 1 target from the target list to perform targeted actions.</p>

		<p>
			<b>Selecing a target</b><br/>
			Click on an entity in the target list, or use [0-9] on your keyboard to target it.</p>
		<p>
			<b>Multi-targeting</b><br/>
			Hold down shift and click on multiple entities to target them all at once.<br/>
			On a touch screen, hold down on a target for multi-targeting.
		</p>
		<p>
			<b>Cycle through targets</b><br/>
			Use the up and down arrow keys on your keyboard to cycle through the targets. Hold shift to select multiple targets in a row.
		</p>
	</div>
</template>

<script>
	export default {
		name: 'TargetingInfo',
		props: ['type', 'data']
	};
</script>
