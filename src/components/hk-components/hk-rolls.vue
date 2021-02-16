<template>
	<div class="hk-rolls center-top">
		<transition-group 
			tag="div"
			class="rolls"
			name="rolls"
			enter-active-class="animated animate__fadeInDown" 
			leave-active-class="animated animate__fadeOutUp"
		>
			<div v-for="(roll, index) in action_rolls" :key="`roll-${roll.key}`" class="roll">
				<div class="header">
					<div class="truncate">
						{{ roll.name }}
					</div>
					<a @click="removeActionRoll(index)">
						<i class="fas fa-times" />
					</a>
				</div>

				<div class="body">
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
								<div
									v-else
									class="total" 
									:class="{
										green: hitOrMiss[roll.key] === 'hit',
										red: hitOrMiss[roll.key] === 'miss'
									}"
								>
									<hk-animated-integer :value="action.toHit.total" onMount />
								</div>
							</div>
							<q-btn-toggle
								v-model="hitOrMiss[roll.key]"
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
											green: savingThrowResult[roll.key] === 'fail',
											red: savingThrowResult[roll.key] === 'save'
										}"
									>
										{{ action.save_dc }}
									</span>
								</div>
							</div>
							<q-btn-toggle
								v-model="savingThrowResult[roll.key]"
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
												:class="[{active: resistances[roll.key] && resistances[roll.key][rolled.damage_type] === key}, key]"
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
											<b><hk-animated-integer :value="totalActionDamage(action, rolled, roll.key)" /></b>
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
										{{ rolled.modifierRoll.roll }} =
										<b>
											<hk-animated-integer :value="rolled.modifierRoll.total" />
										</b><br/>
										<div class="throws">
											<div 
												v-for="(Throw, throw_index) in rolled.modifierRoll.throws"
												:key="`throw-${Throw}-${throw_index}`"
												class="throw rotate"
												:class="{
													red: Throw === 1, green: Throw == rolled.modifierRoll.d}"
												@click="reroll($event, rolled.modifierRoll, throw_index)"
											>
												<hk-animated-integer :value="Throw" onMount/>
												<q-tooltip anchor="top middle" self="bottom middle">
													Reroll {{ Throw }}
												</q-tooltip>
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
									<div v-if="savingThrowResult[roll.key] === 'save'" class="mt-3">
										Successful saving throw: <b>{{ missSaveEffect(rolled.missSave, 'text') }}</b>
									</div>
									<div v-if="hitOrMiss[roll.key] === 'miss'" class="mt-3">
										Missed attack: <b>{{ missSaveEffect(rolled.missSave, 'text') }}</b>
									</div>
									<template v-for="({name, value}, key) in defenses">
										<div 
											v-if="resistances[roll.key] && resistances[roll.key][rolled.damage_type] === key" 
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
										<span v-if="savingThrowResult[roll.key] === 'save' || hitOrMiss[roll.key] === 'miss'"> {{ missSaveEffect(rolled.missSave, 'calc') }}</span>
										<template v-if="resistances[roll.key]">
											<span v-if="resistances[roll.key][rolled.damage_type] === 'v'"> * 2</span>
											<span v-if="resistances[roll.key][rolled.damage_type] === 'r'"> / 2</span>
											<span v-if="resistances[roll.key][rolled.damage_type] === 'i'"> no effect</span>
										</template>
										<span> = <b :class="rolled.damage_type">
											<hk-animated-integer :value="totalActionDamage(action, rolled, roll.key)" />
										</b></span>
									</div>
								</div>
							</q-expansion-item>
						</q-list>

						<div class="total-damage">
							<div>Total {{ action.type === "healing" ? "healing" : "damage" }}</div>
							<div class="total" :class="action.type === 'healing' ? 'green' : 'red'">
								<hk-animated-integer :value="totalDamage(roll)" onMount />
							</div>
						</div>
					</div>
				</div>
			</div>
		</transition-group>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { damage_types } from '@/mixins/damageTypes.js';
import { dice } from '@/mixins/dice';
import hkAnimatedInteger from './hk-animated-integer.vue';

export default {
  components: { hkAnimatedInteger },
	name: 'hk-rolls',
	mixins: [damage_types, dice],
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
		...mapGetters([
			"action_rolls"
		]),
		critSettings() {
			if(this.$store.getters.userSettings && this.$store.getters.userSettings.encounter) {
				return this.$store.getters.userSettings.encounter.critical;
			} return undefined; // Default = undefined = roll twice
		}
	},
	methods: {
		...mapActions([
			"removeActionRoll"
		]),
		advantage(input) {
			const type = Object.keys(input)[0].charAt(0).capitalize();
			const color = (type === "A") ? "green" : "red";
			return `<b class="${color}">${type}</b>`;
		},
		totalActionDamage(action, rolls, key) {
			let total = parseInt(rolls.modifierRoll.total);

			if(rolls.scaledRoll) {
				total = total + rolls.scaledRoll.total;
			}
			if(action.type === 'save' && this.savingThrowResult[key] === 'save') {
				total = Math.floor(total * rolls.missSave);
			}
			if(action.toHit && this.hitOrMiss[key] === 'miss') {
				total = Math.floor(total * rolls.missSave);
			}
			if(this.resistances[key] && this.resistances[key][rolls.damage_type] === 'v') {
				total = total * 2;
			}
			if(this.resistances[key] && this.resistances[key][rolls.damage_type] === 'r') {
				total = Math.floor(total / 2);
			}
			if(this.resistances[key] && this.resistances[key][rolls.damage_type] === 'i') {
				total = 0;
			}
			return total;
		},
		totalDamage(roll) {
			let total = 0;
			for(const action of roll.actions) {
				for(const rolled of action.rolls) {
					total = total + this.totalActionDamage(action, rolled, roll.key);
				}
			}
			return total;
		},
		setDefense(type, resistance, key) {
			if(!this.resistances[key]) this.$set(this.resistances, key, {});
			if(this.resistances[key][type] === resistance) {
				this.$delete(this.resistances[key], type);
			} else {
				this.$set(this.resistances[key], type, resistance);
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
				if(effect === 1) {
					return 'full damage';
				}
				if(effect === .5) {
					return 'half damage';
				}
				if(effect === 0) {
					return 'no damage';
				}
			} else {
				if(effect === 1) {
					return '';
				}
				if(effect === .5) {
					return '/ 2';
				}
				if(effect === 0) {
					return 'no effect';
				}
			}
		}
	}
}
</script>

<style lang="scss" scoped>
	.roll {
		background: $gray-dark;
		border: solid 1px $gray-darker;
		margin-bottom: 15px;

		.body {
			padding: 15px;

			h2 {
				text-transform: none !important;
				font-size: 20px;
			}
			h3 {
				font-size: 15px;
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
			.total-damage {
				display: flex;
				justify-content: space-between;
				font-size: 20px;
				margin-top: 10px;
				line-height: 30px;
				padding: 0 5px;

				.total {
					font-size: 28px;
					font-weight: bold;
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
				}
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