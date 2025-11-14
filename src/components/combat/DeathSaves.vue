<template>
	<div v-if="target.curHp === 0 && !target.stable && !target.dead" class="saves__wrapper">
		<div v-if="showActions" class="d-flex gap-1 justify-content-between items-center">
			<template v-if="Object.keys(target.saves).length < 5 && death_fails < 3 && !target.dead">
				<button
					class="btn btn-block bg-neutral-5"
					@click="save('succes', Object.keys(target.saves).length)"
				>
					<i aria-hidden="true" class="fas fa-check green mr-1" /> Save
				</button>
				<button
					class="btn btn-block bg-neutral-5"
					@click="save('fail', Object.keys(target.saves).length)"
				>
					<i aria-hidden="true" class="fas fa-times red mr-1" /> Fail
				</button>
			</template>
			<button
				v-if="death_fails >= 3"
				class="btn btn-block bg-neutral-5"
				@click="kill_revive(false)"
			>
				<i aria-hidden="true" class="fas fa-skull red mr-1" />
				{{ target.entityType.capitalize() }} died
			</button>
			<button class="btn btn-block bg-neutral-5" @click="stabilize">
				<i aria-hidden="true" class="fas fa-heartbeat mr-1" /> Stabilize
			</button>
		</div>
		<div class="d-flex justify-content-start gap-1 items-center saves">
			<div v-for="(n, index) in 5" :key="index">
				<template v-if="Object.keys(target.saves).length == n">
					<button
						v-show="target.saves[n] === 'succes'"
						class="green pointer"
						@click="save('unset', n)"
					>
						<i aria-hidden="true" class="fas fa-check-circle" />
						<q-tooltip anchor="top middle" self="center middle"> Undo </q-tooltip>
					</button>
					<button v-show="target.saves[n] === 'fail'" class="red pointer" @click="save('unset', n)">
						<i aria-hidden="true" class="fas fa-times-circle" />
						<q-tooltip anchor="top middle" self="center middle"> Undo </q-tooltip>
					</button>
				</template>
				<template v-else>
					<span v-show="target.saves[n] === 'succes'" class="green">
						<i aria-hidden="true" class="fas fa-check-circle" />
					</span>
					<span v-show="target.saves[n] === 'fail'" class="red">
						<i aria-hidden="true" class="fas fa-times-circle" />
					</span>
				</template>
				<span v-show="!target.saves[n]" class="neutral-2">
					<i aria-hidden="true" class="fas fa-skull" />
				</span>
			</div>
		</div>
	</div>
	<button
		v-else-if="target.dead && showActions"
		class="btn bg-neutral-5"
		@click="kill_revive(true)"
	>
		<i aria-hidden="true" class="fas fa-hand-holding-magic mr-1" /> Revive
	</button>
	<button
		v-else-if="target.stable && showActions"
		class="btn bg-neutral-5"
		@click="set_stable({ key: target.key, action: 'unset' })"
	>
		<i aria-hidden="true" class="fas fa-heart-broken mr-1" /> Destabilize
	</button>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { dice } from "src/mixins/dice.js";

export default {
	name: "DeathSaves",
	mixins: [dice],
	props: {
		target: {
			type: Object,
			required: true,
		},
		showActions: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		...mapGetters(["entities", "targeted"]),
		death_fails() {
			let fails = 0;
			for (let key in this.target.saves) {
				if (this.target.saves[key] === "fail") {
					fails++;
				}
			}
			return fails;
		},
	},
	methods: {
		...mapActions(["set_save", "set_dead", "set_stable"]),
		save(check, index) {
			this.set_save({
				key: this.target.key,
				check: check,
				index,
			});
		},
		kill_revive(revive) {
			const action = revive ? "revive" : "set";
			this.set_dead({
				key: this.target.key,
				action,
			});
		},
		stabilize() {
			this.set_stable({
				key: this.target.key,
				action: "set",
			});
		},
	},
};
</script>

<style lang="scss" scoped>
.saves {
	font-size: 18px;

	&__wrapper {
		display: flex;
		gap: 10px;

		button {
			white-space: nowrap;
		}
	}
}
</style>
