<template>
	<div class="pb-5">
		<BasicEntity :entity="entity" />
		<template v-if="cond">
			<h2 :id="`${condition}Table`" class="mt-3">
				<i aria-hidden="true" :class="`hki-${cond.value}`" />
				{{ cond.name }}
			</h2>

			<button
				v-if="entity.conditions[cond.value]"
				class="btn btn-block bg-red mb-3"
				@click="remove(cond.value)"
			>
				Remove condition
			</button>
		</template>

		<table
			v-if="condition === 'exhaustion'"
			class="table"
			:aria-describedby="`${condition}Table`"
		>
			<thead>
				<th>Current</th>
				<th>Effect</th>
			</thead>
			<tbody>
				<tr v-for="(effect, index) in exhaustionLevels" :key="index">
					<td>
						<a
							:class="{ active: entity.conditions['exhaustion'] >= index + 1 }"
							@click="setExhausted(index + 1)"
						>
							<span v-if="entity.conditions['exhaustion'] >= index + 1"
								><i aria-hidden="true" class="fas fa-check"></i
							></span>
							<span v-else>{{ index + 1 }}</span>
						</a>
					</td>
					<td :class="{ 'neutral-2': entity.conditions['exhaustion'] < index + 1 }">
						{{ effect }}
					</td>
				</tr>
			</tbody>
		</table>
		<ul v-if="cond">
			<li v-for="(effect, index) in cond.effects" :key="index">
				{{ effect }}
			</li>
		</ul>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import { EXHAUSTION_LEVELS } from "src/utils/generalConstants.js";

export default {
	name: "Condition",
	components: {
		BasicEntity,
	},
	props: ["data"],
	data() {
		return {
			entity: this.data.entity,
			condition: this.data.condition,
		};
	},
	computed: {
		...mapGetters("api_conditions", ["conditions_by_edition"]),
		edition() {
			return this.$store.getters.edition;
		},
		exhaustionLevels() {
			return EXHAUSTION_LEVELS[this.edition === "5.5e" ? "5.5e" : "5e"];
		},
		cond() {
			const found = this.conditions_by_edition(this.edition).find(
				(item) => item.url === this.condition
			);
			return found
				? {
						value: found.url,
						name: found.name,
						condition: found.condition,
						effects: found.effects,
					}
				: undefined;
		},
	},
	async mounted() {
		await this.fetch_all_conditions({ edition: this.edition });
	},
	methods: {
		...mapActions(["set_condition"]),
		...mapActions("api_conditions", ["fetch_all_conditions"]),
		remove(condition) {
			this.set_condition({
				action: "remove",
				key: this.entity.key,
				condition: condition,
			});
		},
		setExhausted(level) {
			this.set_condition({
				action: "add",
				key: this.entity.key,
				condition: "exhaustion",
				level: level,
			});
		},
	},
};
</script>

<style lang="scss" scoped>
ul {
	padding-left: 20px;

	&.exhaustion {
		list-style: none !important;
		padding-left: 5px;
	}

	li {
		margin-bottom: 10px;
	}
}
h2 {
	i {
		vertical-align: -2px;
	}
}
.table {
	td {
		background: $neutral-9;

		a {
			color: $neutral-6 !important;
			background: $neutral-2;
			line-height: 30px;
			height: 30px;
			display: block;
			text-align: center;

			&.active {
				background: $red;
				color: $white !important;
			}
		}
	}
}
</style>
