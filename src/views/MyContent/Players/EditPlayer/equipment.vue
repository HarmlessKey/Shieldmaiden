<template>
	<div class="equipment">
		<div class="gold">
			Gold
		</div>

		<div v-for="{value, label, icon, items} in types" :key="`type-${value}`" :class="value">
			<h3>
				<span>
					<i :class="icon"/> {{ label }}
				</span>
				<a @click="newItem(value)">
					<i class="fas fa-plus green" />
				</a>
			</h3>
			<q-list dark square class="accordion">
				<q-expansion-item
					v-for="(weapon, index) in items"
					:key="`weapon-${index}`"
					dark switch-toggle-side
					:group="`weapons`"
				>
					<template v-slot:header>
						<q-item-section avatar>
							<q-checkbox 
								dark
								:value="weapon.equipped"
								:false-value="null"
								indeterminate-value="something-else"
								@input="equipItem($event, weapon['.key'])"
							>
								<q-tooltip anchor="top middle" self="center middle">
									{{ weapon.equipped ? "Unequip" : "Equip" }}
								</q-tooltip>
							</q-checkbox>
						</q-item-section>
						<q-item-section avatar>
							<i :class="weapon.weapon_type.split('_')[1] === 'melee' ? 'fas fa-sword' : 'fas fa-bow-arrow'">
								<q-tooltip anchor="top middle" self="center middle">
									{{ weapon.weapon_type.split("_")[1].capitalize() }}
								</q-tooltip>
							</i>
						</q-item-section>
						<q-item-section>
							{{ weapon.name }}
						</q-item-section>
						<q-item-section avatar>
							<div class="actions">
								<a class="gray-light mr-2"><i class="fas fa-pencil-alt"/></a>
								<a class="gray-light" @click.stop="removeItem(weapon['.key'])">
									<i class="fas fa-trash-alt"/>
								</a>
							</div>
						</q-item-section>
					</template>

					<!-- WEAPON -->
					<div v-if="value === 'weapon'" class="accordion-body">
						<q-checkbox 
							dark 
							size="sm"
							class="mb-2"
							:value="weapon.equipped" 
							:false-value="null" 
							indeterminate-value="something-else"
							label="Equipped"
							@input="equipItem($event, weapon['.key'])"
						/>

						<q-input
							dark filled square dense
							label="Name"
							v-model="weapon.name"
							class="mb-2"
						/>

						<q-select 
							dark filled square dense
							label="Ability"
							emit-value
							map-options
							:options="abilities"
							v-model="weapon.ability"
							class="mb-3"
						/>

						<div class="mb-2">Base damage</div>
						<div class="row q-col-gutter-md mb-2">
							<div class="col">
								<q-input
									dark filled square dense
									placeholder="Base damage"
									v-model="weapon.damage"
								/>
							</div>
							<div class="col">
								<q-select 
									dark filled square dense
									placeholder="Damage type"
									emit-value
									map-options
									:options="weapon_damage_types"
									v-model="weapon.damage_type"
								/>
							</div>
						</div>

						<q-input
							dark filled square dense
							label="Versatile damage"
							v-model="weapon.versatile"
							class="mb-2"
						/>

						<template v-if="weapon.weapon_type.split('_')[1] === 'ranged'">
							<div class="mb-2">Range</div>
							<div class="row q-col-gutter-md mb-2">
								<div class="col">
									<q-input
										dark filled square dense
										type="number"
										label="Normal range"
										:value="weapon.range ? weapon.range.split('/')[0] : undefined"
									/>
								</div>
								<div class="col">
									<q-input
										dark filled square dense
										type="number"
										label="Long range"
										:value="weapon.range ? weapon.range.split('/')[1] : undefined"
									/>
								</div>
							</div>
						</template>

						<template v-else>
							<div class="mb-2">Thrown</div>
							<div class="row q-col-gutter-md mb-2" v-if="!weapon.range">
								<div class="col">
									<q-input
										dark filled square dense
										type="number"
										label="Normal range"
										:value="weapon.thrown ? weapon.thrown.split('/')[0] : undefined"
									/>
								</div>
								<div class="col">
									<q-input
										dark filled square dense
										type="number"
										label="Long range"
										:value="weapon.thrown ? weapon.thrown.split('/')[1] : undefined"
									/>
								</div>
							</div>
						</template>

						<div>
							<q-checkbox 
								dark 
								size="sm"
								v-model="weapon.light"
								:disable="weapon.heavy"
								:false-value="null" 
								indeterminate-value="something-else"
								label="Light"
							/>
						</div>
						<q-checkbox 
							dark 
							size="sm"
							v-model="weapon.heavy"
							:disable="weapon.light" 
							:false-value="null" 
							indeterminate-value="something-else"
							label="Heavy"
						/>
					</div>
				</q-expansion-item>
			</q-list>
		</div>

		<q-dialog v-model="addModal">
			<div class="new-item">
				<hk-card>
					<div slot="header" class="card-header d-flex justify-content-between">
						<span>
							Add item
						</span>
						<q-btn flat @click="cancelAdd" round dense icon="close" />
					</div>
					<div v-if="new_item">
						<q-select 
							dark filled square dense
							label="Item type"
							class="mb-2"
							map-options
							emit-value
							v-model="new_item.type"
							:options="types"
							@input="changeType($event)"
						/>

						<div class="form-item mb-3" v-if="new_item.type === 'weapon'">
							<q-select dark filled square dense v-model="new_item.name" :options="weaponList" label="Weapon">
								<template v-slot:selected v-if="new_item.name">
									<span class="mr-1">
										{{ new_item.name  }}
									</span>
								</template>
								<template v-slot:option="scope">
									<q-item :key="`weapon-category-${scope.index}`">
										<q-item-section>
											<q-item-label overline class="text-weight-bold text-white">{{ scope.opt.category }}</q-item-label>
										</q-item-section>
									</q-item>

									<template v-for="weapon in scope.opt.weapons">
										<q-item
											v-if="!['simple_melee', 'simple_ranged', 'martial_melee', 'martial_ranged'].includes(weapon.value)"
											:key="weapon.value"
											clickable
											v-ripple
											v-close-popup
											@click="setWeapon(weapon)"
											:active="new_item.name === weapon.label"
										>
											<q-item-section>
												<q-item-label v-html="weapon.label" class="q-ml-lg" ></q-item-label>
											</q-item-section>
										</q-item>
									</template>
									<q-separator />
								</template>
							</q-select>
						</div>
					</div>
					<div slot="footer" class="card-footer d-flex justify-content-end">
						<button class="btn bg-gray mr-2" @click="cancelAdd">Cancel</button>
						<button class="btn" @click="addItem">Save</button>
					</div>
				</hk-card>
			</div>
		</q-dialog>
	</div>
</template>

<script>
	import ModifierTable from './modifier-table.vue';
	import Modifier from './modifier.vue';
	import { db } from '@/firebase';
	import { abilities } from '@/mixins/abilities.js';
	import { weapons } from '@/mixins/armorAndWeapons.js';
	import { damageTypes } from '@/mixins/damageTypes.js';

	export default {
		name: 'CharacterRace',
		mixins: [abilities, weapons, damageTypes],
		props: [
			"equipment",
			"modifiers",
			"playerId", 
			"userId"
		],
		components: {
			Modifier,
			ModifierTable
		},
		data() {
			return {
				addModal: false,
				new_item: undefined
			}
		},
		computed: {
			types() {
				const types = [
					{
						value: "weapon",
						label: "Weapons",
						icon: "fas fa-swords",
						items: this.weapons
					},
					{
						value: "armor",
						label: "Armor",
						icon: "fas fa-shield",
						items: this.armor
					},
					{
						value: "item",
						label: "Items",
						icon: "fas fa-ring",
						items: this.items
					},
				];
				return types;
			},
			weapon_damage_types() {
				return this.damage_types.filter(type => {
					return ["piercing", "slashing", "bludgeoning"].includes(type.value);
				});
			},
			money() {
				return this.equipment.money;
			},
			weapons() {
				if(this.equipment && this.equipment.items) {
					const weapons = Object.entries(this.equipment.items).filter(item => {
						return item[1].type === 'weapon';
					}).map(obj => {
						let weapon = obj[1];
						weapon['.key'] = obj[0];
						return weapon;
					});
					return weapons;
				} return [];
			},
			armor() {
				if(this.equipment && this.equipment.items) {
					const armor = Object.entries(this.equipment.items).filter(item => {
						return item[1].type === 'armor';
					}).map(obj => {
						let armor = obj[1];
						armor['.key'] = obj[0];
						return armor;
					});
					return armor;
				} return [];
			},
			items() {
				if(this.equipment && this.equipment.items) {
					const items = Object.entries(this.equipment.items).filter(item => {
						return item[1].type === 'item';
					}).map(obj => {
						let item = obj[1];
						item['.key'] = obj[0];
						return item;
					});
					return items;
				} return [];
			}
		},
		methods: {
			newItem(type) {
				this.new_item = {
					type
				}
				this.addModal = true;
			},
			cancelAdd() {
				this.new_item = undefined;
				this.addModal = false;
			},
			changeType(type) {
				this.new_item = {
					type
				}
			},
			addItem() {
				db.ref(`characters_computed/${this.userId}/${this.playerId}/equipment/items`).push(this.new_item);
				this.addModal = false;
			},
			removeItem(key) {
				//Remove modifiers if the item is equipped

				//Remove the item
				db.ref(`characters_computed/${this.userId}/${this.playerId}/equipment/items/${key}`).remove();
			},
			setWeapon(weapon) {
				this.$set(this.new_item, 'value', weapon.value);
				this.$set(this.new_item, 'name', weapon.label);
				this.$set(this.new_item, 'damage', weapon.damage);
				this.$set(this.new_item, 'damage_type', weapon.damage_type);
				this.$set(this.new_item, 'weapon_type', weapon.type);

				//Ability
				if(weapon.type === 'ranged' || weapon.finesse) {
					this.$set(this.new_item, 'ability', 'dexterity');
				} else {
					this.$set(this.new_item, 'ability', 'strength');
				}

				if(weapon.light) this.$set(this.new_item, 'light', weapon.light);
				if(weapon.finesse) this.$set(this.new_item, 'finesse', weapon.finesse);
				if(weapon.thrown) this.$set(this.new_item, 'thrown', weapon.thrown);
				if(weapon.two_handed) this.$set(this.new_item, 'two_handed', weapon.two_handed);
				if(weapon.versatile) this.$set(this.new_item, 'versatile', weapon.versatile);
				if(weapon.range) this.$set(this.new_item, 'range', weapon.range);
				if(weapon.heavy) this.$set(this.new_item, 'heavy', weapon.heavy);
				if(weapon.reach) this.$set(this.new_item, 'reach', weapon.reach);
				if(weapon.special) this.$set(this.new_item, 'special', weapon.special);
			},
			equipItem(e, key) {
				const item = this.equipment.items[key];

				db.ref(`characters_computed/${this.userId}/${this.playerId}/equipment/items/${key}/equipped`).set(e);
			}
		},
	}
</script>

<style lang="scss" scoped>
	h3 {
		font-family: 'Fredericka the Great', cursive !important;
		font-size: 25px !important;
		margin: 0 0 5px 0 !important;
		display: flex;
		justify-content: space-between;
		border-bottom: solid 1px #b2b2b2;
	}

	.equipment {
		display: grid;
		grid-template-rows: 60px 1fr;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 10px;

		.gold {
			grid-column: span 3;
		}
	}
	.new-item {
		min-width: 350px;
	}
</style>