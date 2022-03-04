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
						<q-select 
							:dark="$store.getters.theme === 'dark'" filled square
							:label="`Damage ${type.split('_')[1]}`"
							autocomplete="off"  
							multiple
							:options="damage_types"
							v-model="npc[type]" 
							:hint="resistanceInfo(type)"
						>
							<template slot="prepend">
								<div class="defense" :class="type">
									<i aria-hidden="true" class="fas fa-shield"></i>
									<span>
										{{ type === "damage_vulnerabilities" ? "V" : type === "damage_resistances" ? "R" : "I" }}
									</span>
								</div>
							</template>
							<template v-slot:option="scope">
								<q-item
									clickable
									v-ripple
									:active="npc[type] && npc[type].includes(scope.opt)"
									@click="setResistance(type, scope.opt)"
								>
									<q-item-section avatar>
										<q-icon :name="damage_type_icons[scope.opt]" :class="scope.opt"/>
									</q-item-section>
									<q-item-section>
										<q-item-label v-html="scope.opt.capitalize()"/>
									</q-item-section>
								</q-item>
							</template>
						</q-select>
					</div>
				</div>

				<q-select 
					:dark="$store.getters.theme === 'dark'" filled square
					label="Condition immunities"
					autocomplete="off"  
					type="text" 
					class="mt-3 mb-2" 
					multiple
					:options="condition_list"
					v-model="npc.condition_immunities" 
					name="condition_immunities" 
				>
					<template slot="prepend">
						<i aria-hidden="true" class="fas fa-fist-raised" />
					</template>
					<template v-slot:option="scope">
						<q-item
							clickable
							v-ripple
							:active="npc.condition_immunities && npc.condition_immunities.includes(scope.opt)"
							@click="setCondition(scope.opt)"
						>
							<q-item-section avatar>
								<i aria-hidden="true" :class="`hki-${scope.opt}`" />
							</q-item-section>
							<q-item-section>
								<q-item-label v-html="scope.opt.capitalize()"/>
							</q-item-section>
						</q-item>
					</template>
				</q-select>
			</div>
		</hk-card>
	</div>
</template>

<script>
	import { conditions } from '@/mixins/conditions.js';
	import { damage_types } from '@/mixins/damageTypes.js';

	export default {
		name: 'npc-Defenses',
		props: ['value'],
		mixins: [
			conditions,
			damage_types
		],
		data() {
			return {
			}
		},
		computed: {
			npc: {
				get() {
					return this.value;
				},	
				set(newValue) {
					this.$emit('input', newValue);
				}
			},
			condition_list() {
				return this.conditionList.map(item => {
					return item.value;
				});
			}
		},
		methods: {
			resistanceInfo(type) {
				if(type === "damage_resistances") {
					return "Half of the damage is taken"
				}
				if(type === "damage_vulnerabilities") {
					return "Double damage is taken"
				}
				return "No damage is taken"
			},
			setResistance(type, value) {
				if(!this.npc[type]) {
					this.$set(this.npc, type, [value]);
				} else if(this.npc[type].includes(value)) {
					this.$delete(this.npc[type], this.npc[type].indexOf(value));
				} else {
					this.npc[type].push(value);
				}
			},
			setCondition(value) {
				if(!this.npc.condition_immunities) {
					this.$set(this.npc, "condition_immunities", [value]);
				} else if(this.npc.condition_immunities.includes(value)) {
					this.$delete(this.npc.condition_immunities, this.npc.condition_immunities.indexOf(value));
				} else {
					this.npc.condition_immunities.push(value);
				}
			},
		}
	}
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