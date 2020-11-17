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
					v-for="(item, index) in items"
					:key="`item-${value}-${index}`"
					dark switch-toggle-side
					:group="value"
				>
					<template v-slot:header>
						<q-item-section avatar>
							<q-checkbox 
								dark
								:value="item.equipped"
								:false-value="null"
								indeterminate-value="something-else"
								@input="equipItem($event, item['.key'])"
							>
								<q-tooltip anchor="top middle" self="center middle">
									{{ item.equipped ? "Unequip" : "Equip" }}
								</q-tooltip>
							</q-checkbox>
						</q-item-section>
						<q-item-section avatar v-if="value === 'weapon'">
							<i :class="item.weapon_type.split('_')[1] === 'melee' ? 'fas fa-sword' : 'fas fa-bow-arrow'">
								<q-tooltip anchor="top middle" self="center middle">
									{{ item.weapon_type.split("_")[1].capitalize() }}
								</q-tooltip>
							</i>
						</q-item-section>
						<q-item-section>
							{{ item.name }}
						</q-item-section>
						<q-item-section avatar>
							<div class="actions">
								<a class="gray-light mr-2"><i class="fas fa-pencil-alt"/></a>
								<a class="gray-light" @click.stop="removeItem(item['.key'])">
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
							:value="item.equipped" 
							:false-value="null" 
							indeterminate-value="something-else"
							label="Equipped"
							@input="equipItem($event, item['.key'])"
						/>

						<Weapon v-model="items[index]" @input="updateWeapon" />

						<Modifier-table 
							:modifiers="item.modifiers || []" 
							:origin="`equipment.${item['.key']}`"
							:userId="userId"
							:playerId="playerId"
							@edit="editModifier"
							title="Character modifiers"
							:info="modifierInfo"
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
						<div class="form-item mb-3" v-if="new_item.type === 'armor'">
							<q-select dark filled square dense v-model="new_item.name" :options="armor_types" label="Armor">
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

		<!-- MODIFIER MODAL -->
		<q-dialog v-model="modifier_modal">
      <Modifier :value="modifier" :userId="userId" :playerId="playerId" @save="modifierSaved" />
		</q-dialog>
	</div>
</template>

<script>
	import ModifierTable from '../modifier-table.vue';
	import Modifier from '../modifier.vue';
	import { db } from '@/firebase';
	import { abilities } from '@/mixins/abilities.js';
	import { weapons } from '@/mixins/armorAndWeapons.js';
	import { damageTypes } from '@/mixins/damageTypes.js';
	import Weapon from './weapon.vue'

	export default {
		name: 'Equipment',
		mixins: [abilities, weapons, damageTypes],
		props: [
			"equipment",
			"modifiers",
			"playerId", 
			"userId"
		],
		components: {
			Modifier,
			ModifierTable,
			Weapon
		},
		data() {
			return {
				addModal: false,
				modifier_modal: false,
				modifier: {},
				new_item: undefined,
				modifierInfo: "<p>These modifiers apply to your character, not the item and only when the item is equipped.</p>"
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

						//Modifiers
						weapon.modifiers = this.modifiers.filter(mod => {
							const origin = mod.origin.split(".");
							return origin[1] === obj[0];
						});

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
			editModifier(e) {
				this.modifier_modal = true;
				this.modifier = e.modifier;
			},
			modifierSaved() {
				this.modifier_modal = false;
				this.$emit("change", "modifier.saved");
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
				db.ref(`characters_computed/${this.userId}/${this.playerId}/equipment/items/${key}/equipped`).set(e);
				const equipped = (e) ? "equipped" : "unequipped";
				this.$emit("change", `equipment.item_${equipped}`);
			},
			updateWeapon(e) {
				const weapon = {...e}; //copy the object
				const key = weapon['.key'];
				delete weapon['.key'];
				delete weapon.modifiers; //The object holds modifiers for display, these can't be added into firebase
				db.ref(`characters_computed/${this.userId}/${this.playerId}/equipment/items/${key}`).update(weapon);
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

		.hk-card {
			height: 100%;
		}
	}
</style>