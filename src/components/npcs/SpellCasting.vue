<template>
	<div>
		<hk-card-deck>
			<hk-card v-for="casting in caster_types" :key="casting.category">
				<div slot="header" class="card-header d-flex justify-content-between">
					{{ casting.name }}
					<a 
						v-if="npc[`${casting.category}_ability`]"
						@click="openDialog(casting.category)"
						class="btn btn-sm bg-neutral-5"
					>
						<i class="fas fa-plus green"></i>
						<span class="ml-1">Add spell</span>
					</a>
				</div>

				<div class="card-body">
					<q-select 
						:dark="$store.getters.theme === 'dark'" filled square
						clearable
						label="Spellcasting ability"
						:options="abilities"
						v-model="npc[`${casting.category}_ability`]"
						class="mb-2"
						@input="setCaster($event, casting.category)"
					/>

					<template v-if="npc[`${casting.category}_ability`]">
						<div class="row q-col-gutter-sm">
							<div class="col" v-if="casting.category === 'caster'">
								<ValidationProvider rules="between:1,20|required" name="Caster level" v-slot="{ errors, invalid, validated }">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square
										label="Caster level"
										v-model.number="npc[`${casting.category}_level`]"
										@input="parseToInt(npc, `${casting.category}_level`, !invalid)"
										type="number"
										class="mb-3"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
							</div>
							<div class="col">
								<ValidationProvider rules="between:1,99|required" name="Save DC" v-slot="{ errors, invalid, validated }">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square
										label="Save DC"
										v-model.number="npc[`${casting.category}_save_dc`]"
										@input="parseToInt(npc, `${casting.category}_save_dc`, !invalid)"
										type="number"
										class="mb-3"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
							</div>
							<div class="col">
								<ValidationProvider rules="between:-10,99|required" name="Save DC" v-slot="{ errors, invalid, validated }">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square
										label="Spell attack"
										v-model.number="npc[`${casting.category}_spell_attack`]"
										@input="parseToInt(npc, `${casting.category}_spell_attack`, !invalid)"
										type="number"
										class="mb-3"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
							</div>
						</div>

						<!-- SPELL SLOTS -->
						<template v-if="npc[`${casting.category}_spell_slots`]">
							<label class="d-block mb-3">Spell slots</label>
							<div class="slots">
								<div v-for="level in 9" :key="`level-${level}`" class="slot">
									<div class="level">{{ level | numeral("Oo") }}</div>
									<div class="handling">
										<div 
											class="up" 
											:class="{ disable: npc[`${casting.category}_spell_slots`][level] >= 9 }"
											@click="setSpellSlot('up', level)"
										>
											<i class="fas fa-chevron-up"/>
										</div>
										<input 
											v-model.number="npc[`${casting.category}_spell_slots`][level]" 
											@keyup="checkSpellSlot(level)"
										/>
										<div 
											class="down" 
											:class="{ disable: npc[`${casting.category}_spell_slots`][level] <= 0 }"
											@click="setSpellSlot('down', level)"
										>
											<i class="fas fa-chevron-down"/>
										</div>
									</div>
								</div>
							</div>
						</template>

						<template v-if="npc[`${casting.category}_spells`]">
							<label class="d-block mb-2">Spells</label>
							<q-list :dark="$store.getters.theme === 'dark'">
								<q-item v-for="(spell, key) in npc[`${casting.category}_spells`]" :key="key">
									<q-item-section avatar v-if="casting.category === 'innate'" class="pointer">
										{{ spell.limit === 0 ? "At will" : `${spell.limit}/day` }}
										<q-popup-edit :dark="$store.getters.theme === 'dark'" square v-model.number="spell.limit" buttons>
											<q-checkbox 
												size="sm" :dark="$store.getters.theme === 'dark'" 
												v-model="spell.limit"
												label="At will" 
												:true-value="0" 
												:false-value="1"
												:indeterminate-value="undefined"
												:toggle-indeterminate="false"
												class="mb-2"
												@input="$forceUpdate()"
											/>
											<q-input 
												:dark="$store.getters.theme === 'dark'"
												v-model.number="spell.limit" 
												label="Limit"
												type="number" 
												:disable="spell.limit === 0" 
												suffix="/day"
												@keyup="$forceUpdate()"
											/>
										</q-popup-edit>
									</q-item-section>
									<q-item-section v-else avatar class="neutral-2">
										<template v-if="spell.level > 0">
											{{ spell.level | numeral('Oo') }}
										</template>
										<template v-else>
											Cant
										</template>
									</q-item-section>
									<q-item-section>
										{{ spell.name.capitalizeEach() }}
									</q-item-section>
									<q-item-section avatar>
										<a class="btn btn-sm bg-neutral-5" @click="removeSpell(key, casting.category)">
											<i class="fas fa-trash-alt red" />
											<q-tooltip anchor="top middle" self="center middle">
												Remove spell
											</q-tooltip>
										</a>
									</q-item-section>
								</q-item>
							</q-list>
						</template>
					</template>
				</div>
			</hk-card>
		</hk-card-deck>

		<q-dialog square v-model="spells_dialog">
			<div>
				<hk-card :header="(category === 'caster') ? 'Add spells' : 'Add innate spells'" class="mb-0">
					<div class="card-body">
						<q-input
							:dark="$store.getters.theme === 'dark'" filled square
							label="Search spell"
							v-model="spell_name"
							class="mb-2"
							@change="searchSpells()"
						>
							<a slot="append" color="primary" @click="searchSpells()">
								<i class="fas fa-search" />
							</a>
						</q-input>

						<q-list :dark="$store.getters.theme === 'dark'" v-if="spell_name && spells">
							<q-item v-for="(spell, key) in spells" :key="key">
								<q-item-section>
									{{ spell.name }}
								</q-item-section>
								<q-item-section avatar>
									<i 
										class="fas fa-check mr-2" 
										v-if="npc[`${category}_spells`] && Object.keys(npc[`${category}_spells`]).includes(key)"
									/>
									<a class="btn btn-sm bg-neutral-5" v-else @click="addSpell(key, spell.name.toLowerCase(), spell.level)">
										<i class="fas fa-plus green" />
										<q-tooltip anchor="top middle" self="center middle">
											Add spell
										</q-tooltip>
									</a>
								</q-item-section>
							</q-item>
						</q-list>
						<p class="red" v-if="spell_name && spells === null">
							No spells found with "{{ spell_name }}"
						</p>
					</div>

					<div slot="footer" class="card-footer d-flex justify-content-end">
						<q-btn class="mr-1" type="cancel" v-close-popup>Close</q-btn>
					</div>
				</hk-card>
			</div>
		</q-dialog>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { abilities } from '@/mixins/abilities.js';
	
	export default {
		name: 'npc-SpellCasting',
		props: ['value'],
		mixins: [abilities],
		data() {
			return {
				spells_dialog: false,
				category: undefined,
				spell_name: undefined,
				spells: undefined,
				caster_types: [
					{ category: 'caster', name: 'Spellcasting' },
					{ category: 'innate', name: 'Innate spellcasting' },
				],
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
			}
		},
		methods: {
			parseToInt(value, object, property, valid) {
				if(value === undefined || value === "") {
					this.$delete(object, property);
				} else if(valid) {
					this.$set(object, property, parseInt(value));
				}
			},
			setCaster(value, category) {
				if(value && category === "caster" && !this.npc[`${category}_spell_slots`]) {
					this.npc[`${category}_spell_slots`] = {};
				}
				if(!value) {
					this.$delete(this.npc, `${category}_save_dc`);
					this.$delete(this.npc, `${category}_spell_attack`);
					this.$delete(this.npc, `${category}_spell_slots`);
					this.$delete(this.npc, `${category}_spells`);
				}
			},
			setSpellSlot(direction, level) {
				const current = (this.npc.caster_spell_slots[level]) ? this.npc.caster_spell_slots[level] : 0;
				let newVal;
				if(direction === "up") newVal = current + 1;
				if(direction === "down") newVal = current - 1;

				if(newVal > 9) newVal = 9;
				if(newVal <= 0) {
					this.$delete(this.npc.caster_spell_slots, level);
				} else {
					this.$set(this.npc.caster_spell_slots, level, newVal);
				}
				this.$forceUpdate();
			},
			checkSpellSlot(level) {
				const value = this.npc.caster_spell_slots[level];

				if(value > 9) this.$set(this.npc.caster_spell_slots, level, 9);
				if(value <= 0) {
					this.$delete(this.npc.caster_spell_slots, level);
				}
				this.$forceUpdate();
			},
			openDialog(category) {
				this.category = category;
				this.spells_dialog = true;
			},
			searchSpells() {
				if(this.spell_name) {
					let spells = db.ref(`spells`).orderByChild('name').startAt(this.spell_name.capitalizeEach()).endAt(this.spell_name.capitalizeEach()
					+"\uf8ff");

					// Check username
					spells.on('value' , (snapshot) => {
						this.spells = snapshot.val();
					});
				} else if(!this.spell_name) {
					this.spells = undefined;
				}
			},
			addSpell(key, name, level) {
				if(!this.npc[`${this.category}_spells`]) {
					this.$set(this.npc, `${this.category}_spells`, {})
				}

				let spell = {
					name
				}
				if(this.category === 'innate') spell.limit = 0;
				if(this.category === 'caster') spell.level = level;

				this.npc[`${this.category}_spells`][key] = spell;
				this.$forceUpdate();
			},
			removeSpell(key, category) {
				this.$delete(this.npc[`${category}_spells`], key);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.q-item {
		background-color: $neutral-7;
		margin-bottom: 1px;
	}
	.slots {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;

		.slot {
			max-width: 40px;
			text-align: center;
			color: $neutral-1;

			.handling {
				margin-top: 5px;
				background-color: rgba(255, 255, 255, .07);

				.up, .down {
					background-color: rgba(255, 255, 255, .07);
					font-size: 11px;
					padding: 5px 0;
					cursor: pointer;

					&:hover {
						color: $neutral-1
					}
					.disable {
						opacity: .5;
					}
				}
				input {
					border: none; 
					width: 100%;
					text-align: center;
					background: none;
					font-size: 18px;
					height: 35px;
					line-height: 35px;
					font-weight: bold;
					color: $neutral-1;

					&:focus {
						outline: none;
					}
				}
			}
		}
	}
</style>