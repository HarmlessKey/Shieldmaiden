<template>
	<div class="pb-5">
		<h2>Death Saving Throws</h2>
		<p>
			Whenever a player starts Their Turn with 0 Hit Points, they must make a Special saving throw, 
			called a death saving throw, to determine whether they creep closer to death or hang onto life. 
			Unlike other Saving Throws, this one isn’t tied to any ability score. 
			They are in the hands of fate now, aided only by Spells and features that improve their chances of succeeding on a saving throw.
		</p>

		<p>
			<b>Roll a d20:</b> If the roll is 10 or higher, they succeed. Otherwise, they fail. 
			A success or failure has no effect by itself. On their third success, they become stable (see below). 
			On their third failure, they die. The successes and failures don’t need to be consecutive; keep track of both until they collect three of a kind. 
			The number of both is reset to zero when they regain any Hit Points or become stable.
		</p>

		<p>
			<b>Rolling 1 or 20:</b> When they make a death saving throw and roll a 1 on The D20, it counts as two failures. 
			If they roll a 20 on The D20, they regain 1 hit point.
		</p>

		<p>
			<b>Damage at 0 Hit Points:</b> If they take any damage while they have 0 Hit Points, they suffer a death saving throw failure. 
			If the damage is from a critical hit, they suffer two failures instead. 
			If the damage equals or exceeds their hit point maximum, they suffer Instant Death.
		</p>

		<h2>Stabilizing a player</h2>
		<p>
			The best way to save a player with 0 Hit Points is to heal it. 
			If Healing is unavailable, the player can at least be stabilized so that it isn’t killed by a failed death saving throw.
		</p>
		
		<p>
			One can use their action to administer first aid to an Unconscious player and attempt to stabilize it, 
			which requires a successful DC 10 Wisdom (Medicine) check.
		</p>

		<p>
			A stable player doesn’t make Death Saving Throws, even though it has 0 Hit Points, but it does remain Unconscious. 
			The player stops being stable, and must start making Death Saving Throws again, if it takes any damage. 
			A stable player that isn’t healed regains 1 hit point after 1d4 hours.
		</p>
	</div>
</template>

<script>
	export default {
		name: 'DeathSaves',
		data() {
			return {
				
			}
		},
		methods: {
		
		}
	};
</script>

<style scoped>

</style>
