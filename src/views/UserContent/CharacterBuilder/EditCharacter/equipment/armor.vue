<template>
	<div class="armor">
		<div class="mb-2">
			<i 
				class="mr-1 pointer"
				:class="{
					'fas fa-check green': proficient,
					'fas fa-times red': !proficient
				}"
				aria-hidden="true"
			>
				<q-tooltip anchor="top middle" self="bottom middle">
					{{ proficient ? "Proficient" : "Not proficient" }}
				</q-tooltip>

				<q-menu square anchor="top middle" self="bottom middle" max-width="250px" v-if="!proficient">
					<q-card dark square>
						<q-card-section class="bg-gray-active">
							<strong>{{ armor.type.capitalize() }} proficiency</strong>
						</q-card-section>

						<q-card-section>
							Wearing {{ armor.type === "shield" ? `a ${armor.type}` : armor.type }} 
							when you're not proficient with it results in disadvantage
							on ability checks, saving throws and attack rolls that require strength or dexterity.
						</q-card-section>
					</q-card>
				</q-menu>
			</i>
			{{ title }}
		</div>
		<q-input
			dark filled square dense
			label="Name"
			v-model="armor.name"
			class="mb-2"
		/>

		<template v-if="armor.type === 'armor'">
			<q-input
				dark filled square dense
				label="Armor class"
				type="number"
				v-model="armor.armor_class"
				class="mb-2"
			/>
			<div class="mb-2">
				<q-checkbox 
					dark 
					size="sm"
					v-model="armor.dex_mod"
					:false-value="null" 
					indeterminate-value="something-else"
				>
					Dexterity modifier 
					<q-icon name="info" class="pointer">
						<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
							<q-card dark square>
								<q-card-section class="bg-gray-active">
									<strong>Dexterity modifier</strong>
								</q-card-section>

								<q-card-section>
									Is the dexterity modifier still added to the armor class if this armor is worn?
								</q-card-section>
							</q-card>
						</q-menu>
					</q-icon>
				</q-checkbox>
			</div>
			<q-input
				v-if="armor.dex_mod && armor.armor_type === 'medium'"
				dark filled square dense
				label="Dexterity maximum"
				type="number"
				v-model="armor.dex_max"
				class="mb-2"
			>
				<template v-slot:append>
					<q-icon name="info" class="pointer blue">
						<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
							<q-card dark square>
								<q-card-section class="bg-gray-active">
									<strong>Dexterity maximum</strong>
								</q-card-section>

								<q-card-section>
									What is the maximum of the dexterity modifier that is added to the armor class?
								</q-card-section>
							</q-card>
						</q-menu>
					</q-icon>
				</template>
			</q-input>
			<q-input
				v-if="armor.armor_type === 'heavy'"
				dark filled square dense
				label="Strength score required"
				v-model="armor.strength_required"
				type="number"
				class="mb-2"
			>
				<template v-slot:append>
					<q-icon name="info" class="pointer blue">
						<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
							<q-card dark square>
								<q-card-section class="bg-gray-active">
									<strong>Strength required</strong>
								</q-card-section>

								<q-card-section>
									If the wearer doesn't meet the required strength score, their speed is reduced by 10 feet.
								</q-card-section>
							</q-card>
						</q-menu>
					</q-icon>
				</template>
			</q-input>
			<q-checkbox 
				dark 
				size="sm"
				v-model="armor.stealth_disadvantage"
				:false-value="null" 
				indeterminate-value="something-else"
				label="Stealth disadvantage"
			/>
		</template>
		<template v-else>
			<q-input
				dark filled square dense
				label="Armor class modifier"
				type="number"
				v-model="armor.armor_class_mod"
				class="mb-2"
			/>
		</template>
	</div>
</template>

<script>
	export default {
		name: 'Armor',
		props: {
			value: {
				type: Object,
				required: true
			},
			proficient: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			armor() {
				return this.value;
			},
			title() {
				return (this.armor.type === "shield") ? "Shield" :
					`${this.armor.armor_type.capitalize()} armor: ${this.armor.value.replace("_", " ").capitalize()}`
			},
		},
		watch: {
			armor: {
				deep: true,
				handler(newVal) {
					this.$emit('input', newVal);
				}
			}
		}
	}
</script>