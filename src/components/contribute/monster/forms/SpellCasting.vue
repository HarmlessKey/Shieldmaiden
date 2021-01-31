<template>
	<div>
		<hk-card-deck>
			<hk-card v-for="casting in caster_types" :key="casting.category">
				<div slot="header" class="card-header d-flex justify-content-between">
					{{ casting.name }}
					<a class="gray-hover text-capitalize" @click="openDialog(casting.category)">
						<i class="fas fa-plus green"></i>
						<span class="d-none d-md-inline ml-1">Add spell</span>
					</a>
				</div>

				<q-select 
					dark filled square
					clearable
					label="Spellcasting ability"
					:options="abilities"
					v-model="npc[`${casting.category}_ability`]"
					class="mb-2"
				/>
				<div class="row q-col-gutter-sm">
					<div class="col" v-if="casting.category === 'caster'">
						<q-input 
							dark filled square
							label="Caster level"
							v-model="npc[`${casting.category}_level`]"
							type="number"
							class="mb-3"
						/>
					</div>
					<div class="col">
						<q-input 
							dark filled square
							label="Save DC"
							v-model="npc[`${casting.category}_save_dc`]"
							type="number"
							class="mb-3"
						/>
					</div>
					<div class="col">
						<q-input 
							dark filled square
							label="Spell attack"
							v-model="npc[`${casting.category}_spell_attack`]"
							type="number"
							class="mb-3"
						/>
					</div>
				</div>

				<q-list dark v-if="npc[`${casting.category}_spells`]">
					<q-item v-for="(name, key) in npc[`${casting.category}_spells`]" :key="key">
						<q-item-section>
							{{ name.capitalizeEach() }}
						</q-item-section>
						<q-item-section avatar>
							<a @click="removeSpell(key)">
								<i class="fas fa-trash-alt red" />
								<q-tooltip anchor="top middle" self="center middle">
									Remove spell
								</q-tooltip>
							</a>
						</q-item-section>
					</q-item>
				</q-list>
			</hk-card>
		</hk-card-deck>

		<q-dialog square v-model="spells_dialog">
			<div>
					<hk-card :header="(category === 'caster') ? 'Add spells' : 'Add innate spells'" class="mb-0">
						<q-input
							dark filled square
							label="Search spell"
							v-model="spell_name"
							class="mb-2"
							@change="searchSpells()"
						>
							<a slot="append" color="primary" @click="searchSpells()">
								<i class="fas fa-search" />
							</a>
						</q-input>

						<q-list dark v-if="spell_name && spells">
							<q-item v-for="(spell, key) in spells" :key="key">
								<q-item-section>
									{{ spell.name }}
								</q-item-section>
								<q-item-section avatar>
									<i 
										class="fas fa-check" 
										v-if="npc[`${category}_spells`] && Object.keys(npc[`${category}_spells`]).includes(key)"
									/>
									<a v-else @click="addSpell(key, spell.name.toLowerCase())">
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
			openDialog(category) {
				this.category = category;
				this.spells_dialog = true;
			},
			searchSpells() {
				if(this.spell_name) {
					let spells = db.ref(`spells`).orderByChild('name').startAt(this.spell_name).endAt(this.spell_name+"\uf8ff");

					// Check username
					spells.on('value' , (snapshot) => {
						this.spells = snapshot.val();
					});
				} else if(!this.spell_name) {
					this.spells = undefined;
				}
			},
			addSpell(key, name) {
				if(!this.npc[`${this.category}_spells`]) {
					this.$set(this.npc, `${this.category}_spells`, {})
				}
				this.npc[`${this.category}_spells`][key] = name;
				this.$forceUpdate();
			},
			removeSpell(key) {
				this.$delete(this.npc[`${this.category}_spells`], key);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.q-item {
		background-color: $gray-dark;
		margin-bottom: 1px;
	}
</style>