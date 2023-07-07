<template>
	<div>
		<hk-card header="Resistances & Vulnerabilities">
			<div class="card-body">
				<div class="row q-col-gutter-md mb-2">
					<div
						v-for="type in ['damage_vulnerabilities', 'damage_resistances', 'damage_immunities']"
						class="col-12 col-md-4"
						:key="type"
					>
						<hk-dmg-type-select
							v-model="entity[type]"
							:options="damage_types"
							multiple
							non-magical
							:label="`Damage ${type.split('_')[1]}`"
							:hint="resistanceInfo(type)"
						>
							<template slot="prepend">
								<div class="defense" :class="type">
									<i aria-hidden="true" class="fas fa-shield"></i>
									<span>
										{{
											type === "damage_vulnerabilities"
												? "V"
												: type === "damage_resistances"
												? "R"
												: "I"
										}}
									</span>
								</div>
							</template>
						</hk-dmg-type-select>
					</div>
				</div>

				<hk-condition-select
					v-model="entity.condition_immunities"
					label="Condition immunities"
					class="mt-3 mb-2"
					multiple
				>
					<template slot="prepend">
						<i aria-hidden="true" class="fas fa-fist-raised" />
					</template>
				</hk-condition-select>
			</div>
		</hk-card>
	</div>
</template>

<script>
import { conditions } from "src/mixins/conditions.js";
import { damage_types, damage_type_icons } from "src/utils/generalConstants";

export default {
	name: "Defenses",
	props: ["value"],
	mixins: [conditions],
	data() {
		return {
			damage_types: damage_types,
			damage_type_icons: damage_type_icons,
		};
	},
	computed: {
		entity: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
			},
		},
		condition_list() {
			return this.conditionList.map((item) => {
				return item.value;
			});
		},
	},
	methods: {
		resistanceInfo(type) {
			if (type === "damage_resistances") {
				return "Half of the damage is taken";
			}
			if (type === "damage_vulnerabilities") {
				return "Double damage is taken";
			}
			return "No damage is taken";
		},
		setCondition(value) {
			if (!this.entity.condition_immunities) {
				this.$set(this.entity, "condition_immunities", [value]);
			} else if (this.entity.condition_immunities.includes(value)) {
				this.$delete(
					this.entity.condition_immunities,
					this.entity.condition_immunities.indexOf(value)
				);
			} else {
				this.entity.condition_immunities.push(value);
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.defense {
	position: relative;
	width: 23px;
	font-size: 23px;
	text-align: center;
	line-height: 28px;

	span {
		font-size: 15px;
		text-align: center;
		font-weight: bold;
		position: absolute;
		width: 23px;
		line-height: 27px;
		top: 0;
		left: 0;
		color: $neutral-1;
	}

	&.damage_vulnerabilities {
		color: $red;
	}
	&.damage_resistances {
		color: $orange;
	}
	&.damage_immunities {
		color: $green;
	}
}
</style>
