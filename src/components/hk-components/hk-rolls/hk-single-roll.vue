<template>
	<div  class="roll">
		<div class="header">
			<div class="truncate">
				{{ roll.name }}
			</div>
			<a @click="removeActionRoll(index)">
				<i class="fas fa-times" />
			</a>
		</div>

		<div class="body">
			<!-- TARGET -->
			<div class="target-item" v-if="roll.target">
				<icon v-if="['monster', 'player', 'companion'].includes(roll.target.img)" class="img" :icon="roll.target.img" :fill="roll.target.color_label" :style="roll.target.color_label ? `border-color: ${roll.target.color_label}` : ``" />
				<span 
					v-else class="img" 
					:style="{ 'background-image': 'url(' + roll.target.img + ')' }"
				/>
				<div class="ac_wrapper">
					<i class="fas fa-shield" ></i>
					<span 
						v-if="roll.target.ac_bonus"
						class="ac" 
						:class="{ 
							'green': roll.target.ac_bonus > 0,
							'red': roll.target.ac_bonus < 0 
						}" 
					>
						{{ displayStats(roll.target).ac + roll.target.ac_bonus}}
					</span>
					<span class="ac" v-else>
						{{ displayStats(roll.target).ac }}
					</span>
				</div>
				<div class="pl-2 truncate">
					{{ roll.target.name }}
				</div>
			</div>

			<!-- ALL ROLLED ACTIONS -->
			<div v-for="(action, action_index) in roll.actions" :key="`action-${index}-${action_index}`">
				<!-- TO HIT ROLL -->
				<template v-if="action.toHit">
					<div class="toHit">
						<div>
							To hit: 
							<span class="advantage" v-if="action.toHit.ignored">
								<span v-html="advantage(action.toHit.advantage_disadvantage)"/> 
								<span class="ignored gray-hover">
									{{ action.toHit.ignored }}
								</span>
							</span>{{ action.toHit.throwsTotal }}
							<template v-if="parseInt(action.toHit.mod) !== 0">
								{{ parseInt(action.toHit.mod) > 0 ? `+ ${parseInt(action.toHit.mod)}` : `- ${Math.abs(action.toHit.mod)}` }}
							</template>
						</div>
						<transition
							v-if="action.toHit.throwsTotal == 1"
							:name="`${roll.key}`"
							enter-active-class="animated animate__hinge"
							appear
						>
							<div class="total crit red">
								Crit 
								<b><hk-animated-integer :value="1" onMount /></b>
							</div>
						</transition>
						<transition
							v-else-if="action.toHit.throwsTotal == 20"
							name="heartBeat"
							enter-active-class="animated animate__heartBeat"
							appear
						>
							<div class="total crit green">
								Crit 
								<b><hk-animated-integer :value="20" onMount /></b>
							</div>
						</transition>
						<div v-else class="total">
							<hk-animated-integer :value="action.toHit.total" onMount />
						</div>
					</div>
					<q-btn-toggle
						v-model="hitOrMiss[action_index]"
						class="mb-3"
						spread no-caps dark dense square
						toggle-color="primary"
						color="gray"
						:options="[
							{label: 'Hit', value: 'hit'},
							{label: 'Miss', value: 'miss'}
						]"
					/>
				</template>

				<!-- SAVING THROW -->
				<template v-if="action.type === 'save'">
					<div class="toHit">
						<div>
							{{ action.save_ability.capitalize() }} save
						</div>
						<div>
							<span class="gray-hover">DC</span>
							<span 
								class="total" 
								:class="{
									green: savingThrowResult[action_index] === 'fail',
									red: savingThrowResult[action_index] === 'save'
								}"
							>
								{{ action.save_dc }}
							</span>
						</div>
					</div>
					<q-btn-toggle
						v-model="savingThrowResult[action_index]"
						class="mb-3"
						spread no-caps dark dense square
						toggle-color="primary"
						color="gray"
						:options="[
							{label: 'Fail', value: 'fail'},
							{label: 'Save', value: 'save'}
						]"
					/>
				</template>

				<!-- DAMAGE / HEALING ROLLS -->
				<q-list dark square :class="`accordion`">
					<q-expansion-item
						v-for="(rolled, rolled_index) in action.rolls" 
						:key="`rolled-${rolled_index}`"
						dark switch-toggle-side
						:group="`rolled-${index}`"
					>
						<template #header>
							<q-item-section v-if="action.type === 'healing'">
								<span class="type truncate green">
										<i class="fas fa-heart"/> 
										Healing
									</span>
							</q-item-section>
							<q-item-section v-else>
								<div class="defenses">
									<div 
										v-for="({name}, key) in defenses"
										:key="key"
										class="option"
										@click.stop="setDefense(rolled.damage_type, key, roll.key)"
										:class="[{active: resistances && resistances[rolled.damage_type] === key}, key]"
									>
										<i class="fas fa-shield"></i>
										<span>{{ key.capitalize() }}</span>
										<q-tooltip anchor="top middle" self="center middle">
											{{ name }}
										</q-tooltip>
									</div>
									<span 
										class="type truncate"
										:class="rolled.damage_type"
									>
										<i :class="damage_type_icons[rolled.damage_type]"/> 
										{{ rolled.damage_type }}
									</span>
								</div>
							</q-item-section>
							<q-item-section avatar :class="action.type === 'healing' ? 'green' : 'red'">
								<q-item-label>
									<b><hk-animated-integer :value="totalRollValue(action, action_index, rolled)" /></b>
								</q-item-label>
								<q-tooltip anchor="top middle" self="center middle">
										{{ rolled.modifierRoll.roll }}
								</q-tooltip>
							</q-item-section>
						</template>
						<div class="accordion-body">
							<div>
								<b>Rolls: </b>
								<template v-if="action.toHit && action.toHit.throwsTotal == 20">
									<b class="green">Crit!</b>
									{{ !critSettings ? "Rolled dice twice" : "Doubled rolled values"}}
								</template><br/>
								{{ rolled.modifierRoll.roll }}
								<div class="d-flex justify-content-between">
									<div class="throws">
										<div 
											v-for="(Throw, throw_index) in rolled.modifierRoll.throws"
											:key="`throw-${Throw}-${throw_index}`"
											class="throw"
											:class="{
												red: Throw === 1, green: Throw == rolled.modifierRoll.d,
												rotate: animateRoll === roll.key+rolled_index+throw_index
												}"
											@click="
												animateRoll = roll.key+rolled_index+throw_index,
												reroll($event, rolled.modifierRoll, throw_index)
											"
											@animationend="animateRoll = undefined"
										>
											<hk-animated-integer :value="Throw" onMount/>
											<q-tooltip anchor="top middle" self="bottom middle">
												Reroll {{ Throw }}
											</q-tooltip>
										</div>
									</div>
									<div class="d-flex justify-content-end">
										<template v-if="parseInt(rolled.modifierRoll.mod)">
											<q-separator vertical dark />
											<div class="throws-modifier">
												{{ rolled.modifierRoll.mod }}
											</div>
										</template>
										<q-separator vertical dark />
										<div class="throws-total">
											<hk-animated-integer :value="rolled.modifierRoll.total" />
										</div>
									</div>
								</div>
							</div>
							<div v-if="rolled.scaledRoll" class="mt-3">
								Scale ({{ selectedLevel }}): {{ rolled.scaledRoll.roll }} = <b>{{ rolled.scaledRoll.total }}</b><br/>
								{{ rolled.scaledRoll.throws }}
							</div>
							<div v-if="rolled.scaledRoll" class="mt-3">
								Scale ({{ selectedLevel }}): {{ rolled.scaledRoll.roll }} = <b>{{ rolled.scaledRoll.total }}</b><br/>
								{{ rolled.scaledRoll.throws }}
							</div>
							<div v-if="savingThrowResult[action_index] === 'save'" class="mt-3">
								Successful saving throw: <b>{{ missSaveEffect(rolled.missSave, 'text') }}</b>
							</div>
							<div v-if="hitOrMiss[action_index] === 'miss'" class="mt-3">
								Missed attack: <b>{{ missSaveEffect(rolled.missSave, 'text') }}</b>
							</div>
							<template v-for="({name, value}, key) in defenses">
								<div 
									v-if="resistances && resistances[rolled.damage_type] === key" 
									class="mt-3"
									:key="`defense-${name}`"
								>
									{{ name }} to {{ rolled.damage_type }}: <b>{{ value }} damage</b>
								</div>
							</template>
							<hr>
							<div>
								<b>Final result:</b><br/>	
								(<hk-animated-integer :value="rolled.modifierRoll.total" /><span v-if="rolled.scaledRoll"> + 
								{{ rolled.scaledRoll.total }}</span>)
								<span v-if="savingThrowResult[action_index] === 'save' || hitOrMiss[action_index] === 'miss'"> {{ missSaveEffect(rolled.missSave, 'calc') }}</span>
								<template v-if="resistances">
									<span v-if="resistances[rolled.damage_type] === 'v'"> * 2</span>
									<span v-if="resistances[rolled.damage_type] === 'r'"> / 2</span>
									<span v-if="resistances[rolled.damage_type] === 'i'"> no effect</span>
								</template>
								<span> = <b :class="rolled.damage_type">
									<hk-animated-integer :value="totalRollValue(action, action_index, rolled)" />
								</b></span>
							</div>
						</div>
					</q-expansion-item>
				</q-list>

				<!-- TOTAL OF THE ACTION -->
				<div class="total-action-damage" v-if="roll.actions.length > 1">
					<div>Total {{ action.type === "healing" ? "healing" : "damage" }}</div>
					<div class="total" :class="action.type === 'healing' ? 'green' : 'red'">
						<hk-animated-integer :value="totalActionValue(action, action_index)" onMount />
					</div>
				</div>
			</div>

			<!-- TOTALS OF ALL ACTIONS -->
			<template v-for="type in ['damage', 'healing']">
				<div class="total-damage" :key="type" v-if="totalValue[type] !== undefined">
					<div>Total {{ type }}</div>
					<div class="total" :class="type === 'healing' ? 'green' : 'red'">
						<hk-animated-integer :value="totalValue[type]" onMount />
					</div>
				</div>
			</template>
		</div>

		<div class="footer" v-if="roll.target">
			<q-btn color="gray" class="full-width" label="Cancel" icon="fas fa-times" no-caps @click="removeActionRoll(index)" />
			<q-btn color="gray" class="full-width" label="Apply" icon="fas fa-check" no-caps @click="apply()" />
		</div>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import { damage_types } from '@/mixins/damageTypes.js';
import { dice } from '@/mixins/dice';
import { setHP } from '@/mixins/HpManipulations';

export default {
	name: 'hk-single-roll',
	props: {
		value: {
			type: Object,
			required: true
		},
		index: {
			type: Number,
			required: true
		}
	},
	mixins: [damage_types, dice, setHP],
	data() {
		return {
			defenses: {
				v: { name: "Vulnerable", value: "double" },
				r: { name: "Resistant", value: "half" },
				i: { name: "Immune", value: "no" }
			},
			resistances: {},
			savingThrowResult: {},
			hitOrMiss: {},
			animateRoll: undefined,
			resultColumns: {
				total: {
					maxContent: true
				},
				type: {
					truncate: true
				}
			}
		}
	},
	computed: {
		roll() {
			return this.value;
		},
		critSettings() {
			if(this.$store.getters.userSettings && this.$store.getters.userSettings.encounter) {
				return this.$store.getters.userSettings.encounter.critical;
			} return undefined; // Default = undefined = roll twice
		},
		totalValue() {
			let total = {};
			
			// Separate damage and healing
			const healing_actions = this.roll.actions.filter((action, index) => {
				action.index = index;
				return action.type === 'healing';
			});
			const damage_actions = this.roll.actions.filter((action, index) => {
				action.index = index;
				return action.type !== 'healing';
			});

			if(healing_actions.length > 0) {
				let healing_total = 0;
				for(const action of healing_actions) {
					healing_total = healing_total + this.totalActionValue(action, action.index);
				}
				total.healing = healing_total;
			}

			if(damage_actions.length > 0) {
				let damage_total = 0;
				for(const action of damage_actions) {
					damage_total = damage_total + this.totalActionValue(action, action.index);
				}
				total.damage = damage_total;
			}
			return total;
		},
	},
	mounted() {
		this.checkHitOrMiss();
	},
	methods: {
		...mapActions([
			"removeActionRoll"
		]),
		checkHitOrMiss() {
			this.roll.actions.forEach((action, index) => {
				if(action.toHit) {
					if(action.toHit.throwsTotal === 20) this.$set(this.hitOrMiss, index, "hit");
					else if(action.toHit.throwsTotal === 1) this.$set(this.hitOrMiss, index, "miss");
					else if(this.roll.target) {
						if(this.displayStats(this.roll.target).ac <= action.toHit.total) this.$set(this.hitOrMiss, index, "hit");
						else this.$set(this.hitOrMiss, index, "miss");
					}
				}
			});
		},
		advantage(input) {
			const type = Object.keys(input)[0].charAt(0).capitalize();
			const color = (type === "A") ? "green" : "red";
			return `<b class="${color}">${type}</b>`;
		},
		apply() {
			// Create the info object for the log
			let config = {
				log: true,
				ability: this.roll.name,
				defenses: this.resistances
			};
			let actions = [];

			this.roll.actions.forEach((action, index) => {
				let new_action = {
					type: action.type
				};
				if(action.toHit) {
					new_action.hitOrMiss = this.hitOrMiss[index];
					if(action.toHit.throwsTotal === 20) new_action.crit = true;
				}
				if(action.type === "save") new_action.savingThrowResult = this.savingThrowResult[index];

				new_action.rolls = [];
				for(const rolled of action.rolls) {
					let roll = {};
					if(action.type !== "healing") roll.damage_type = rolled.damage_type;
					roll.value = this.totalRollValue(action, index, rolled);
					new_action.rolls.push(roll);
				}
				actions.push(new_action);
			});
			config.actions = actions;

			this.setHP(this.totalValue, this.roll.target, this.roll.current, config);
			this.removeActionRoll(this.index);
		},
		totalRollValue(action, action_index, rolls) {
			let total = parseInt(rolls.modifierRoll.total);

			if(rolls.scaledRoll) {
				total = total + rolls.scaledRoll.total;
			}
			if(action.type === 'save' && this.savingThrowResult[action_index] === 'save') {
				total = Math.floor(total * rolls.missSave);
			}
			if(action.toHit && this.hitOrMiss[action_index] === 'miss') {
				total = Math.floor(total * rolls.missSave);
			}
			if(this.resistances && this.resistances[rolls.damage_type] === 'v') {
				total = total * 2;
			}
			if(this.resistances && this.resistances[rolls.damage_type] === 'r') {
				total = Math.floor(total / 2);
			}
			if(this.resistances && this.resistances[rolls.damage_type] === 'i') {
				total = 0;
			}
			return total;
		},
		totalActionValue(action, action_index) {
			let total = 0;
			action.rolls.forEach((roll) => {
				total = total + this.totalRollValue(action, action_index, roll);
			});
			return total;
		},
		setDefense(type, resistance, key) {
			if(!this.resistances) this.$set(this.resistances, key, {});
			if(this.resistances[type] === resistance) {
				this.$delete(this.resistances, type);
			} else {
				this.$set(this.resistances, type, resistance);
			}
		},
		reroll(e, roll, throw_index) {
			const add = (a, b) => a + b;
			const newRoll = this.rollD(e, roll.d, 1, 0, `Reroll 1d${roll.d}`);
			this.$set(roll.throws, throw_index, newRoll.total);
			this.$set(roll, "throwsTotal", roll.throws.reduce(add));
			this.$set(roll, "total", roll.throwsTotal + parseInt(roll.mod));
		},
		missSaveEffect(effect, type) {
			if(type === 'text') {
				if(effect === 1) return 'full damage';
				if(effect === .5)	return 'half damage';
				if(effect === 0) return 'no damage';
			} else {
				if(effect === 1) return '';
				if(effect === .5) return '/ 2';
				if(effect === 0) return 'no effect';
			}
		},
		displayStats(target) {
			let stats = '';
			if(target.transformed) {
				stats = {
					ac: target.transformedAc,
					maxHp: target.transformedMaxHp,
					maxHpMod: target.transformedMaxHpMod,
					curHp: target.transformedCurHp,
				}
			}
			else {
				stats = {
					ac: target.ac,
					maxHp: target.maxHp,
					maxHpMod: target.maxHpMod,
					curHp: target.curHp,
				}
			}
			return stats
		},
	}
}
</script>

<style lang="scss" scoped>
	.roll {
		background: $gray-dark;
		border: solid 1px $gray-darker;
		margin-bottom: 15px;
		box-shadow: 0 1px 5px $black;

		.body {
			padding: 15px;

			h2 {
				text-transform: none !important;
				font-size: 20px;
			}
			h3 {
				font-size: 15px;
			}

			.target-item {
				margin-bottom: 15px;
				background-color: $gray;
				border: solid 1px $gray-active;

				.ac_wrapper {
					background-color: $gray-darker;
				}
			}

			.save {
				a {
					margin-left: 5px;
				}
			}
			.toHit {
				position: relative;
				display: flex;
				justify-content: space-between;
				font-size: 18px;
				margin-bottom: 10px;
				line-height: 30px;
				padding: 0 5px;
				z-index: 99;

				.total {
					font-size: 25px;
					font-weight: bold;
				}
			}
			.total-damage, .total-action-damage {
				display: flex;
				justify-content: space-between;
				line-height: 30px;
				padding: 0 5px;

				.total {
					font-weight: bold;
				}
			}
			.total-damage {
				font-size: 20px;
				margin-top: 10px;

				.total {
					font-size: 28px;
				}
			}
			.defenses {
				display: grid;
				grid-template-columns: 18px 18px 18px auto;
				grid-column-gap: 5px;
				user-select: none;
				line-height: 28px;

				.type {
					padding-left: 10px;
				}

				.option {
					cursor: pointer;
					position: relative;
					width: 18px;
					font-size: 18px;
					text-align: center;
					line-height: 28px;
					color: $gray-light;

					span {
						font-size: 12px;
						text-align: center;
						font-weight: bold;
						position: absolute;
						width: 18px;
						line-height: 28px;
						top: 0;
						left: 0;
						color: $gray-dark;
					}

					&.active {
						&.i, &.r { color: $green; }
						&.v { color: $red; }
						span {
							color: $white;
						}
					}
				}
			}
			.throws {
				display: flex;
				flex-wrap: wrap;
				margin-top: 5px;
				margin-right: 5px;

				.throw {
					border: solid 1px $gray-hover;
					padding: 1px 0;
					width: 23px;
					text-align: center;
					margin-right: 2px;
					cursor: pointer;
					user-select: none;

					&:hover {
						border-color: $gray-light;
					}
					&.rotate {
						animation: spin .2s linear;
					}
					&.green {
						font-weight: bold;
					}
				}
			}
			.throws-modifier, .throws-total {
				padding: 0 10px;
				align-self: center;
			}
			.throws-total {
				font-weight: bold;
				font-size: 18px;
				padding-right: 0;
			}
		}
	}
	.animate__heartBeat {
		animation-delay: .2s;
	}
	.animate__hinge {
		animation-delay: .5s;
	}
	@keyframes spin { 100% { transform: rotate(360deg); } }
</style>