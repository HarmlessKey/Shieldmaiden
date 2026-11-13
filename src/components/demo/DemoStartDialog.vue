<template>
	<q-dialog v-model="show" persistent>
		<hk-card header="Try Shieldmaiden" :min-width="300">
			<div class="card-body">
				<p>Pick the edition you play, then run our premade encounter or build your own.</p>
				<label class="demo-start__label">Edition</label>
				<q-btn-toggle
					v-model="edition"
					class="mb-3"
					spread
					no-caps
					toggle-color="primary"
					:options="editionOptions"
				/>
				<label class="demo-start__label">How do you want to start?</label>
				<div class="demo-start__choices">
					<button class="btn btn-lg" @click="premade">
						<i aria-hidden="true" class="fas fa-swords" />
						Run the premade encounter
					</button>
					<button class="btn btn-lg bg-neutral-5" @click="build">
						<i aria-hidden="true" class="fas fa-helmet-battle" />
						Build your own encounter
					</button>
				</div>
			</div>
		</hk-card>
	</q-dialog>
</template>

<script>
import { mapActions } from "vuex";
import { editions } from "src/utils/generalConstants";

/**
 * The demo's start modal on /demo: the edition the demo runs in (5.5e by default), and running
 * the premade encounter or building one. Persistent: it only closes on a choice.
 */
export default {
	name: "DemoStartDialog",
	data() {
		return {
			show: true,
			edition: "5.5e",
			editionOptions: editions.map(({ value, label }) => ({ value, label })),
		};
	},
	methods: {
		...mapActions("encounters", ["set_demo_edition", "clear_demo_encounter"]),
		async premade() {
			await this.clear_demo_encounter();
			await this.set_demo_edition(this.edition);
			this.$router.push("/demo/run-encounter");
		},
		build() {
			this.set_demo_edition(this.edition);
			this.show = false;
		},
	},
};
</script>

<style lang="scss" scoped>
.demo-start {
	&__label {
		display: block;
		margin-bottom: 5px;
		color: $neutral-1;
	}
	&__choices {
		display: flex;
		flex-direction: column;
		gap: 10px;

		.btn {
			width: 100%;
		}
	}
}
</style>
