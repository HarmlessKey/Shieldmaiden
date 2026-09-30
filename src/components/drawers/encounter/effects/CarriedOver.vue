<template>
	<div class="pb-5">
		<h2>Carried-over effects</h2>
		<p class="neutral-2">
			These effects were applied in an earlier encounter, and their caster or Concentration isn't
			part of this one. Keep them to let them run on their holder's own turns, or remove them.
		</p>
		<ul v-if="entries.length" class="carried-over">
			<li v-for="entry in entries" :key="`${entry.holderKey}:${entry.effectKey}`">
				<div class="carried-over__info">
					<strong>{{ entry.holderName }}: {{ entry.name }}</strong>
					<div class="neutral-2">
						{{ entry.duration }}
						<template v-if="entry.casterName"> · from {{ entry.casterName }}</template>
					</div>
				</div>
				<div class="carried-over__actions">
					<button class="btn btn-sm bg-neutral-5" @click="keep(entry)">Keep</button>
					<button class="btn btn-sm bg-red" @click="remove(entry)">Remove</button>
				</div>
			</li>
		</ul>
		<p v-else class="mt-3">Nothing left to review.</p>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { describeDuration } from "src/utils/effectFunctions";

export default {
	name: "CarriedOver",
	props: ["data"],
	data() {
		return {
			// Entries the DM has handled in this drawer
			done: [],
		};
	},
	computed: {
		...mapGetters(["entities", "effect_review"]),
		entries() {
			return (this.effect_review || [])
				.filter(({ holderKey, effectKey }) => !this.done.includes(`${holderKey}:${effectKey}`))
				.map(({ holderKey, effectKey }) => {
					const holder = this.entities[holderKey];
					const instance = holder?.effects?.[effectKey];
					if (!instance) return undefined;
					return {
						holderKey,
						effectKey,
						holderName: holder.name,
						name: (instance.name || "").capitalize(),
						duration: describeDuration(instance, {
							casterName: instance.caster_name,
							holderName: holder.name,
						}),
						casterName: instance.caster_name,
					};
				})
				.filter(Boolean);
		},
	},
	methods: {
		...mapActions(["set_effect_prop", "remove_effect"]),
		/**
		 * Keeps the effect and clears its dangling references, so it isn't reviewed again
		 * and runs on its holder's own turns
		 */
		async keep({ holderKey, effectKey }) {
			for (const property of ["caster_key", "concentration_id"]) {
				await this.set_effect_prop({ key: holderKey, effectKey, property, value: null });
			}
			this.done.push(`${holderKey}:${effectKey}`);
		},
		async remove({ holderKey, effectKey }) {
			await this.remove_effect({ key: holderKey, effectKey });
			this.done.push(`${holderKey}:${effectKey}`);
		},
	},
};
</script>

<style lang="scss" scoped>
ul.carried-over {
	list-style: none;
	padding: 0;

	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		margin-bottom: 3px;
		background-color: $neutral-9;
	}
	.carried-over__actions {
		display: flex;
		gap: 5px;
		flex-shrink: 0;
	}
}
</style>
