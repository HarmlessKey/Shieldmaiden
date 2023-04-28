<template>
	<hk-card header="Projectiles" :min-width="300">
		<div class="card-body">
			<p>Assign {{ available_projectiles }} projectiles.</p>
			<div v-for="key in targeted" :key="`target-${key}`" class="target">
				<span class="btn btn-sm bg-neutral-5 mr-1">
					{{ assigned_projectiles[key] || 0 }}
				</span>
				<TargetItem :item="key" />
				<button
					class="btn btn-sm bg-red mx-1"
					@click="setProjectile(false, key)"
					:disabled="!assigned_projectiles[key]"
				>
					<i aria-hidden="true" class="fas fa-minus" />
				</button>
				<button
					class="btn btn-sm bg-green"
					@click="setProjectile(true, key)"
					:disabled="!available_projectiles"
				>
					<i aria-hidden="true" class="fas fa-plus" />
				</button>
			</div>
		</div>
		<div slot="footer" class="card-footer">
			<q-btn label="Cancel" no-caps @click="cancel()" />
			<q-btn
				label="Roll"
				color="primary"
				no-caps
				@click="roll()"
				:disable="available_projectiles > 0"
			/>
		</div>
	</hk-card>
</template>

<script>
import { mapGetters } from "vuex";
import TargetItem from "src/components/combat/TargetItem.vue";

export default {
	name: "Projectiles",
	props: {
		projectileCount: {
			type: Number,
			required: true,
		},
	},
	components: {
		TargetItem,
	},
	data() {
		return {
			assigned_projectiles: {},
		};
	},
	computed: {
		...mapGetters(["encounter", "targeted"]),
		available_projectiles() {
			return (
				this.projectileCount - Object.values(this.assigned_projectiles).reduce((a, b) => a + b, 0)
			);
		},
	},
	methods: {
		setProjectile(add, key) {
			const count = this.assigned_projectiles[key];
			let new_value = count || 0;

			new_value = add ? new_value + 1 : new_value - 1;

			this.$set(this.assigned_projectiles, key, new_value.between(0, this.projectileCount));
		},
		cancel() {
			this.$emit("cancel");
		},
		roll() {
			this.$emit("roll", this.assigned_projectiles);
		},
	},
};
</script>

<style lang="scss" scoped>
.target {
	display: flex;
	justify-content: space-between;
	margin-bottom: 1px;
}
</style>
