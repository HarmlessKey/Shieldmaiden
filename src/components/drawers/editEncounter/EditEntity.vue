<!-- EDIT NPC IN EDIT ENCOUNTER SCREEN -->

<template>
	<div class="pb-5">
		<h2>
			Edit <strong>{{ npc.name.capitalize() }}</strong>
		</h2>

		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(edit)" greedy>
				<ValidationProvider
					rules="max:100|required"
					name="Name"
					v-slot="{ errors, invalid, validated }"
				>
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Name *"
						v-model="npc.name"
						class="mb-2"
						placeholder="Name"
						maxlength="100"
						:error="invalid && validated"
						:error-message="errors[0]"
					/>
				</ValidationProvider>
				<div class="avatar">
					<div
						class="img"
						:style="{
							backgroundImage: 'url(\'' + npc.avatar + '\')',
							'border-color': npc.color_label ? npc.color_label : ``,
							color: npc.color_label ? npc.color_label : ``,
						}"
					>
						<i aria-hidden="true" v-if="!npc.avatar" class="hki-monster" />
					</div>
					<ValidationProvider
						rules="url|max:2000"
						name="Avatar"
						v-slot="{ errors, invalid, validated }"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="Avatar"
							v-model="npc.avatar"
							class="mb-2"
							placeholder="Input URL"
							maxlength="2000"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					</ValidationProvider>
				</div>
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					v-model="npc.color_label"
					label="Color label"
					readonly
				>
					<template v-slot:append>
						<q-icon name="colorize" class="cursor-pointer">
							<q-popup-proxy transition-show="scale" transition-hide="scale">
								<q-color v-model="npc.color_label" :palette="hkColors" default-view="palette" />
							</q-popup-proxy>
						</q-icon>
					</template>
				</q-input>

				<q-checkbox
					:dark="$store.getters.theme === 'dark'"
					v-model="npc.friendly"
					label="Friendly NPC"
					color="positive"
					class="my-3"
					:false-value="null"
					indeterminate-value="something else"
				/>

				<div class="d-flex justify-content-between">
					<ValidationProvider
						rules="required|between:1,99"
						name="Armor class"
						v-slot="{ errors, invalid, validated }"
						class="full-width"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="Armor class *"
							class="mr-2"
							type="number"
							min="1"
							max="99"
							v-model.number="npc.ac"
							:error="invalid && validated"
							:error-message="errors[0]"
						>
							<template v-slot:append>
								<i aria-hidden="true" class="fas fa-shield" />
							</template>
						</q-input>
					</ValidationProvider>

					<ValidationProvider
						rules="required|between:1,999"
						name="Hit points"
						v-slot="{ errors, invalid, validated }"
						class="full-width"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="Hit points *"
							type="number"
							min="1"
							max="999"
							v-model.number="npc.maxHp"
							placeholder="Hit Points"
							:error="invalid && validated"
							:error-message="errors[0]"
						>
							<template v-slot:append>
								<q-icon name="favorite" />
							</template>
						</q-input>
					</ValidationProvider>
				</div>
				<div class="d-flex items-center my-3">
					<q-btn color="primary" type="submit" class="full-width">Save</q-btn>
					<q-icon v-if="!valid" name="error" color="red" size="md" class="ml-2">
						<q-tooltip anchor="top middle" self="bottom right">
							There are validation errors
						</q-tooltip>
					</q-icon>
				</div>
			</q-form>
		</ValidationObserver>
		<small>
			Slightly tweak your NPC for the current encounter.
			<span v-if="!demo"
				>If you want to make a completely unique NPC, use our
				<router-link to="/content/npcs">NPC creator</router-link>.</span
			>
		</small>
	</div>
</template>

<script>
import { mapActions } from "vuex";

export default {
	name: "EditNpc",
	props: ["data"],
	data() {
		return {
			demo: this.$route.name === "ToolsBuildEncounter",
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			npc: { ...this.data.npc },
			encounter: this.data.encounter,
			hkColors: ["#88b3ce", "#9ac16a", "#c45e66", "#db815e", "#e2da5f", "#9b7aba"],
		};
	},
	methods: {
		...mapActions("encounters", ["edit_entity"]),
		...mapActions(["setDrawer"]),
		edit() {
			this.npc.curHp = this.npc.maxHp;

			if (!this.demo) {
				this.edit_entity({
					campaignId: this.campaignId,
					encounterId: this.encounterId,
					entityId: this.npc.key,
					entity: this.npc,
				}).then(() => {
					this.setDrawer(false);
				});
			} else {
				this.encounter.entities[this.npc.key] = this.npc;
				this.setDrawer(false);
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.avatar {
	display: grid;
	grid-template-columns: 56px 1fr;
	grid-column-gap: 10px;

	.img {
		border: solid 1px $neutral-3;
		display: block;
		width: 56px;
		height: 56px;
		background-size: cover;
		background-position: center top;
		font-size: 45px;
		line-height: 56px;
	}
}
</style>
