<template>
	<div class="armor">
		<div class="mb-2">
			{{ title }}
		</div>
		<q-input
			dark filled square dense
			label="Name"
			v-model="armor.name"
			class="mb-2"
		/>

		<template v-if="armor.type === 'armor'">
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
									<b>Dexterity modifier</b>
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
				v-if="armor.dex_mod"
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
									<b>Dexterity maximum</b>
								</q-card-section>

								<q-card-section>
									What is the maximum of the dexterity modifier that is added to the armor class?<br/>
									Leave blank if there is no maximum.
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

<style lang="scss" scoped>
	
</style>