<template>
	<div>
		<h2 class="mb-1">
			Transform <span class="blue">{{ entity.name }}</span>
		</h2>
		<button v-if="entity.transformed" @click="remove()" autofocus class="btn btn-block bg-red">
			Remove transformation
		</button>
		<template v-else>
			<small class="mb-3 d-block">
				Transform the entity into another creature. You can use this for a druid's Wild Shape, or
				for the Polymorph spell. Damage and healing is handled as the Player's Handbook describes it
				should work for Wild Shape (phb 67).
			</small>
			<Form v-slot="{ handleSubmit }">
				<div class="mb-2">Manual transform</div>
				<q-form @submit="handleSubmit(edit())">
					<div class="row q-col-gutter-md">
						<div class="col">
							<Field
								rules="between:1,99|required"
								name="AC"
								v-slot="{ errorMessage, meta }"
							>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									square
									filled
									label="Armor class"
									autocomplete="off"
									autofocus
									type="number"
									class="mb-2"
									v-model="transAc"
									min="1"
									max="99"
									:error="!meta.valid && meta.validated"
									:error-message="errorMessage"
								/>
							</Field>
						</div>

						<div class="col">
							<Field
								rules="between:1,9999|required"
								name="HP"
								v-slot="{ errorMessage, meta }"
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
									:error="!meta.valid && meta.validated"
									:error-message="errorMessage"
								/>
							</Field>
						</div>
					</div>
					<q-btn no-caps label="Transform" class="full-width mb-3" color="primary" type="submit" />
				</q-form>
			</Form>

			<hk-transform-select @select="edit" />
		</template>
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
			transAc: null,
			transHp: null,
		};
	},
	methods: {
		...mapActions(["setDrawer", "transform_entity"]),
		edit(beast) {
			const transform = beast
				? {
						ac: beast.armor_class,
						maxHp: beast.hit_points,
						curHp: beast.hit_points,
				  }
				: {
						ac: parseInt(this.transAc),
						maxHp: parseInt(this.transHp),
						curHp: parseInt(this.transHp),
				  };
			this.transform_entity({
				key: this.entity.key,
				entity: transform,
			});
			this.setDrawer(false);
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
