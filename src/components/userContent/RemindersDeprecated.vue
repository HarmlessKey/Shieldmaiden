<template>
	<div class="reminders-deprecated">
		<div class="reminders-deprecated__title">
			<i aria-hidden="true" class="fas fa-exclamation-triangle orange mr-1" />
			Personal reminders are deprecated
		</div>
		<p>
			You can still view and delete your reminders here, but you can no longer create or edit them,
			and the combat tracker no longer offers them. Two newer features do what they did, and more:
		</p>
		<ul>
			<li>
				<strong>Effects</strong> track what's going on with a creature: conditions, spells like
				Bless or Hex, concentration and their durations. They change its rolls and values, and
				prompt you when something should happen, like a save at the end of its turn. Build your own
				under <router-link to="/content/effects">Effects</router-link>.
			</li>
			<li>
				<strong>Encounter reminders</strong> come up at the right moment in an encounter: when
				combat starts, at a round or a turn of the round, at a creature's turn, or when it's
				defeated. They can offer an effect or damage. Add them in the combat tracker, with the
				<i aria-hidden="true" class="fas fa-bell" /> buttons.
			</li>
		</ul>
	</div>
</template>

<script>
/**
 * The notice on the deprecated personal reminders (effects 9): what replaced them
 */
export default {
	name: "RemindersDeprecated",
};
</script>

<style lang="scss" scoped>
.reminders-deprecated {
	border-left: solid 4px $orange;
	background-color: $neutral-8;
	border-radius: $border-radius;
	padding: 10px 15px;
	margin-bottom: 20px;

	&__title {
		font-weight: bold;
		margin-bottom: 5px;
	}
	ul {
		margin: 0;
		padding-left: 20px;

		li {
			margin-bottom: 5px;
		}
	}
	p {
		margin-bottom: 5px;
	}
}
</style>
