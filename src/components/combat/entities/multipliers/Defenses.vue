<template>
	<div class="defenses">
		<button
			v-for="({ name }, key) in defenses"
			:key="key"
			class="option"
			@click.stop="setDefense(key)"
			:class="[{ active: defense === key }, key]"
		>
			<i aria-hidden="true" class="fas fa-shield"></i>
			<span>{{ key.capitalize() }}</span>
			<q-tooltip anchor="top middle" self="center middle">
				{{ name }}
			</q-tooltip>
		</button>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { defenses } from "src/utils/generalConstants";

export default {
	name: "Defenses",
	props: {
		entityKey: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			defenses: defenses,
		};
	},
	computed: {
		...mapGetters(["target_multipliers", "entities", "manual"]),
		defense() {
			const entity = JSON.parse(JSON.stringify(this.entities[this.entityKey]));
			let resistance;
			for (const [key, defense] of Object.entries(this.defenses)) {
				let resistances = entity[defense.value];
				resistances = resistances?.map((res) => {
					return this.manual.magical ? res : res.replace(/non_magical_/, "");
				});
				if (resistances?.includes(this.manual.type)) {
					resistance = key;
				}
			}
			return this.target_multipliers.defenses[this.entityKey] !== undefined
				? this.target_multipliers.defenses[this.entityKey]
				: resistance;
		},
	},
	methods: {
		...mapActions(["setMultipliers"]),
		setDefense(defense) {
			const value = this.defense === defense ? null : defense;
			this.setMultipliers({ key: this.entityKey, type: "defenses", value });
		},
	},
};
</script>

<style lang="scss" scoped>
.defenses {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 2px;

	.option {
		cursor: pointer;
		position: relative;
		width: 18px;
		font-size: 18px;
		text-align: center;
		line-height: 28px;
		color: $neutral-2;

		span {
			font-size: 12px;
			text-align: center;
			font-weight: bold;
			position: absolute;
			width: 18px;
			line-height: 28px;
			top: 0;
			left: 0;
			color: $neutral-8;
		}

		&.active {
			&.i,
			&.r {
				color: $green;
			}
			&.v {
				color: $red;
			}
			span {
				color: $neutral-1;
			}
		}
	}
}
</style>
