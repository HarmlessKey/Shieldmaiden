<template>
	<div class="pb-5">
		<h2>
			Transform <span class="blue">{{ entity.name }}</span>
		</h2>
		<a v-if="entity.transformed" @click="remove()" class="btn btn-block bg-red"
			>Remove transformation</a
		>
		<ValidationObserver v-else v-slot="{ handleSubmit }">
			<q-form @submit="handleSubmit(edit)">
				<div class="row q-col-gutter-md">
					<div class="col">
						<ValidationProvider
							rules="between:1,99|required"
							name="AC"
							v-slot="{ errors, invalid, validated }"
						>
							<q-input
								:dark="$store.getters.theme === 'dark'"
								square
								filled
								label="Armor class"
								autocomplete="off"
								type="number"
								class="mb-2"
								v-model="transAc"
								min="1"
								max="99"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>

					<div class="col">
						<ValidationProvider
							rules="between:1,9999|required"
							name="HP"
							v-slot="{ errors, invalid, validated }"
						>
							<q-input
								:dark="$store.getters.theme === 'dark'"
								square
								filled
								label="Hit points"
								autocomplete="off"
								type="number"
								min="1"
								max="9999"
								v-model="transHp"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
				</div>
				<q-btn no-caps label="Transform" class="full-width mb-3" color="primary" type="submit" />

				<small>
					Transform the entity into another creature. You can use this for a druid's Wild Shape, or
					for the Polymorph spell. Damage and healing is handled as the Player's Handbook describes
					it should work for Wild Shape (phb 67).
				</small>
			</q-form>
		</ValidationObserver>
	</div>
</template>

<script>
import { mapActions } from "vuex";

export default {
	name: "Transform",
	props: ["data"],
	data() {
		return {
			entity: this.data,
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			transAc: "",
			transHp: "",
		};
	},
	methods: {
		...mapActions(["setSlide", "transform_entity"]),
		edit() {
			let transform = {
				ac: parseInt(this.transAc),
				maxHp: parseInt(this.transHp),
				curHp: parseInt(this.transHp),
			};

			this.transform_entity({
				key: this.entity.key,
				entity: transform,
			});
			this.setSlide(false);
		},
		remove() {
			this.transform_entity({
				key: this.entity.key,
				remove: true,
			});
			this.entity.transformed = false;
		},
	},
};
</script>
