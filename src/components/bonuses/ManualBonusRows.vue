<template>
	<ul v-if="bonuses.length" class="manual-bonuses">
		<li v-for="bonus in bonuses" :key="bonus.id">
			<q-input
				:dark="$store.getters.theme === 'dark'"
				:value="bonus.value"
				class="manual-bonuses__amount"
				filled
				square
				dense
				type="number"
				label="Value"
				@change="$emit('update', { bonus, amount: $event.target.value, label: bonus.label })"
			/>
			<q-input
				:dark="$store.getters.theme === 'dark'"
				:value="bonus.label"
				class="manual-bonuses__label"
				filled
				square
				dense
				maxlength="50"
				label="Label"
				@change="$emit('update', { bonus, amount: bonus.value, label: $event.target.value })"
			/>
			<button type="button" class="btn btn-sm bg-neutral-5" @click="$emit('remove', bonus)">
				<i aria-hidden="true" class="fas fa-trash-alt red" />
				<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
			</button>
		</li>
	</ul>
	<p v-else class="neutral-2">{{ empty }}</p>
</template>

<script>
/**
 * The manual bonuses of one value, each with its value and label to change and a remove
 * button. Emits update({ bonus, amount, label }) and remove(bonus).
 */
export default {
	name: "ManualBonusRows",
	props: {
		// [{ id, value, label }]
		bonuses: { type: Array, required: true },
		empty: { type: String, default: "No manual bonuses." },
	},
};
</script>

<style lang="scss" scoped>
.manual-bonuses {
	list-style: none;
	padding: 0;
	margin: 0 0 10px 0;

	li {
		display: flex;
		align-items: center;
		gap: 5px;
		margin-bottom: 5px;
		min-width: 0;
	}
	&__amount {
		width: 80px;
		flex-shrink: 0;
	}
	&__label {
		flex-grow: 1;
		min-width: 0;
	}
}
</style>
