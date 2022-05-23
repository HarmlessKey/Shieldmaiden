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
								:disable="checkEquipped(item.type) > 0 && !item.equipped"
								@input="equipItem($event, item.type, item['.key'])"
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
					<div class="accordion-body">
						<q-checkbox 
							dark 
							size="sm"
							class="mb-2"
							:value="item.equipped" 
							:false-value="null" 
							indeterminate-value="something-else"
							:disable="checkEquipped(item.type) > 0 && !item.equipped"
							label="Equipped"
							@input="equipItem($event, item.type, item['.key'])"
						/>

						<Weapon v-if="value === 'weapon'" v-model="items[index]" @input="updateItem" :proficient="checkProficiency(item.type, item.weapon_type, item.value)" />

						<Armor v-if="['armor', 'shield'].includes(value)" v-model="items[index]" @input="updateItem" :proficient="checkProficiency(item.type, item.armor_type)" />

						<div v-if="value === 'item'">

						</div>

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
										{{ new_item.name }}
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
											<q-item-label overline class="text-weight-bold text-white">{{ scope.opt.label }}</q-item-label>
										</q-item-section>
									</q-item>

									<template v-for="armor in scope.opt.armor">
										<q-item
											:key="armor.value"
											clickable
											v-ripple
											v-close-popup
											@click="setArmor(armor)"
											:active="new_item.name === armor.label"
										>
											<q-item-section>
												<q-item-label v-html="armor.label" class="q-ml-lg" ></q-item-label>
											</q-item-section>
											<q-item-section avatar>
												<div class="ac_wrapper">
													<i class="fas fa-shield" ></i>
													<span class="ac">
														{{ armor.armor_class_mod ? `+${armor.armor_class_mod}` : armor.armor_class }}
													</span>
												</div>
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
	import { db } from 'src/firebase';
	import { abilities } from 'src/mixins/abilities.js';
	import { weapons } from 'src/mixins/armorAndWeapons.js';
	import { damage_types } from 'src/mixins/damageTypes.js';
	import Weapon from './weapon.vue'
	import Armor from './armor.vue'

	export default {
		name: 'Equipment',
		mixins: [abilities, weapons, damage_types],
		props: [
			"equipment",
			"modifiers",
			"proficiencies",
			"playerId", 
			"userId"
		],
		components: {
			Modifier,
			ModifierTable,
			Weapon,
			Armor
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
						return ["armor", "shield"].includes(item[1].type);
					}).map(obj => {
						let armor = obj[1];
						armor['.key'] = obj[0];

						//Modifiers
						armor.modifiers = this.modifiers.filter(mod => {
							const origin = mod.origin.split(".");
							return origin[1] === obj[0];
						});

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

						//Modifiers
						item.modifiers = this.modifiers.filter(mod => {
							const origin = mod.origin.split(".");
							return origin[1] === obj[0];
						});

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
			checkEquipped(type) {
				//Check if an item of this type is allready equiped
				return Object.entries(this.equipment.items).filter(item => {
					return item[1].type === type && item[1].equipped;
				}).length;
			},
			removeItem(key) {
				//Delete all modifiers linked to the item
				const linked_modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[1] === key;
				});

				for(const modifier of linked_modifiers) {
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${modifier['.key']}`).remove();
				}

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
			setArmor(armor) {
				this.$set(this.new_item, 'value', armor.value);
				this.$set(this.new_item, 'name', armor.label);
				this.$set(this.new_item, 'armor_type', armor.type);

				//Shield
				if(armor.type === "shield") {
					this.$set(this.new_item, 'type', 'shield');
					this.$set(this.new_item, 'armor_class_mod', armor.armor_class_mod);
				} else {
					this.$set(this.new_item, 'armor_class', armor.armor_class);
				}

				if(armor.dex_mod) this.$set(this.new_item, 'dex_mod', armor.dex_mod);
				if(armor.dex_max) this.$set(this.new_item, 'dex_max', armor.dex_max);
				if(armor.stealth_disadvantage) this.$set(this.new_item, 'stealth_disadvantage', armor.stealth_disadvantage);
				if(armor.strength_required) this.$set(this.new_item, 'strength_required', armor.strength_required);
			},
			equipItem(e, type, key) {
				if(!e || type === "item" || !this.checkEquipped(type)) {
					db.ref(`characters_computed/${this.userId}/${this.playerId}/equipment/items/${key}/equipped`).set(e);
					const equipped = (e) ? "equipped" : "unequipped";
					this.$emit("change", `equipment.item_${equipped}`);
				}
			},
			updateItem(e) {
				const item = {...e}; //copy the object
				const key = item['.key'];
				delete item['.key'];
				delete item.modifiers; //The object holds modifiers for display, these can't be added into firebase
				db.ref(`characters_computed/${this.userId}/${this.playerId}/equipment/items/${key}`).update(item);
			},
			checkProficiency(type, category, value) {
				if(this.proficiencies) {
					if(type === 'weapon' && this.proficiencies.weapon) {
						if(this.proficiencies.weapon.includes(category) || this.proficiencies.weapon.includes(value)) {
							return true;
						}
					}
					if(type === 'armor' && this.proficiencies.armor) {
						if(this.proficiencies.armor.includes(category)) {
							return true;
						}
					}
				}
					return false;
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
	.ac_wrapper {
		position: relative;
		width: 30px;
		height: 32px;

		i, .ac {
			position: absolute;
			line-height: 32px;
			text-align: center;
			right: 0;
			top: 0;
			width: 30px
		}
		i {
			font-size: 30px;
			color: #5c5757;
		}
		.ac {
			font-weight: bold;
			color: #fff;
			margin-top: -1px;
		}
	}
</style>