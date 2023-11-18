<template>
	<div class="card-body">
		<p>
			The public initiative list is accessible through a link you can share with your party, or you
			can put it up on a second screen for your party to see. In here players can follow the
			encounter, see who's turn it is and what the status of the entities within the encounter is.
			Below you can determine what should be visible on the public initiative list.
		</p>
		<a @click="setDrawer({ show: true, type: 'PlayerLink' })" class="btn bg-neutral-4 mb-3">
			Share your adventures
		</a>

		<div v-for="({ name, type_settings }, type_key) in types" :key="type_key">
			<h3 class="mt-3 mb-1" v-if="name">{{ name }}</h3>
			<q-select
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				v-for="(setting, index) in type_settings"
				:options="setting.options"
				:value="index"
				class="mb-1"
				:key="`${type_key}-${index}`"
			>
				<q-item :dark="$store.getters.theme === 'dark'" slot="selected">
					<q-item-section avatar>
						<q-icon :name="setting.icon" class="neutral-2" size="large" />
					</q-item-section>
					<q-item-section class="neutral-2 truncate">
						<q-item-label>{{ setting.name }}</q-item-label>
						<q-item-label caption>
							{{
								displaySetting(
									type_key,
									setting.key,
									settings[setting.entity] ? settings[setting.entity][setting.key] : undefined
								).name
							}}
						</q-item-label>
					</q-item-section>
					<q-item-section side>
						<q-icon
							:name="
								displaySetting(
									type_key,
									setting.key,
									settings[setting.entity] ? settings[setting.entity][setting.key] : undefined
								).icon
							"
							:class="
								displaySetting(
									type_key,
									setting.key,
									settings[setting.entity] ? settings[setting.entity][setting.key] : undefined
								).color
							"
							size="medium"
						/>
					</q-item-section>
				</q-item>
				<template v-slot:option="scope">
					<q-item
						clickable
						v-ripple
						v-close-popup
						:active="
							selected(
								scope.opt.value,
								settings[setting.entity] ? settings[setting.entity][setting.key] : undefined
							)
						"
						@click="setSetting(setting.entity, setting.key, scope.opt.value)"
					>
						<q-item-section>
							<q-item-label v-text="scope.opt.name" />
						</q-item-section>
						<q-item-section avatar>
							<q-icon :name="scope.opt.icon" size="small" :class="scope.opt.color" />
						</q-item-section>
					</q-item>
				</template>
				<hk-popover v-if="setting.info" slot="after" :header="setting.name">
					<q-icon name="info" size="sm" color="neutral-3" />
					<div slot="content" v-html="setting.info" />
				</hk-popover>
			</q-select>
		</div>

		<a class="btn mt-3 bg-neutral-5" @click="set_default_settings('track')"> Reset to default </a>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "TrackEncounterSettings",
	data() {
		return {
			userId: this.$store.getters.user.uid,
			types: {
				general: {
					type_settings: [
						{
							key: "meters",
							entity: "player",
							name: "Damage Meters",
							icon: "fas fa-swords",
							info: "Players can see the damage meters.",
							options: [
								{
									value: false,
									name: "Hidden",
									action: "Hide",
									icon: "fas fa-eye-slash",
									color: "red",
								},
								{
									value: undefined,
									name: "Shown",
									action: "Show",
									icon: "fas fa-eye",
									color: "green",
								},
							],
						},
					],
				},
				npcs: {
					name: "NPC's",
					type_settings: [
						{
							key: "name",
							entity: "npc",
							name: "Name",
							icon: "fas fa-helmet-battle",
							info: "Players can see the names of NPC's.",
							options: [
								{
									value: false,
									name: "Hidden",
									action: "Hide",
									icon: "fas fa-eye-slash",
									color: "red",
								},
								{
									value: undefined,
									name: "Shown",
									action: "Show",
									icon: "fas fa-eye",
									color: "green",
								},
							],
						},
						{
							key: "health",
							entity: "npc",
							name: "Health",
							icon: "fas fa-heart",
							info: "Players can see the health of NPC's.",
							options: [
								{
									value: undefined,
									name: "Hidden",
									action: "Hide",
									icon: "fas fa-eye-slash",
									color: "red",
								},
								{
									value: "obscured",
									name: "Obsc",
									action: "Obsc",
									icon: "fas fa-question-circle",
									color: "orange",
								},
								{ value: true, name: "Shown", action: "Show", icon: "fas fa-eye", color: "green" },
							],
						},
						{
							key: "ac",
							entity: "npc",
							name: "Armor Class",
							icon: "fas fa-shield",
							info: "Players can see the armor class of NPC's.",
							options: [
								{
									value: undefined,
									name: "Hidden",
									action: "Hide",
									icon: "fas fa-eye-slash",
									color: "red",
								},
								{ value: true, name: "Shown", action: "Show", icon: "fas fa-eye", color: "green" },
							],
						},
						{
							key: "conditions",
							entity: "npc",
							name: "Conditions",
							icon: "fas fa-flame",
							info: "Players can see the conditions on NPC's.",
							options: [
								{
									value: false,
									name: "Hidden",
									action: "Hide",
									icon: "fas fa-eye-slash",
									color: "red",
								},
								{
									value: undefined,
									name: "Shown",
									action: "Show",
									icon: "fas fa-eye",
									color: "green",
								},
							],
						},
					],
				},
				players: {
					name: "Players",
					type_settings: [
						{
							key: "health",
							entity: "player",
							name: "Health",
							icon: "fas fa-heart",
							info: "Players can see the health of players.",
							options: [
								{
									value: false,
									name: "Hidden",
									action: "Hide",
									icon: "fas fa-eye-slash",
									color: "red",
								},
								{
									value: "obscured",
									name: "Obsc",
									action: "Obsc",
									icon: "fas fa-question-circle",
									color: "orange",
								},
								{
									value: undefined,
									name: "Shown",
									action: "Show",
									icon: "fas fa-eye",
									color: "green",
								},
							],
						},
						{
							key: "ac",
							entity: "player",
							name: "Armor Class",
							icon: "fas fa-shield",
							info: "Players can see the armor class of players.",
							options: [
								{
									value: false,
									name: "Hidden",
									action: "Hide",
									icon: "fas fa-eye-slash",
									color: "red",
								},
								{
									value: undefined,
									name: "Shown",
									action: "Show",
									icon: "fas fa-eye",
									color: "green",
								},
							],
						},
						{
							condition: "conditions",
							entity: "player",
							name: "Conditions",
							icon: "fas fa-flame",
							info: "Players can see the conditions of players.",
							options: [
								{
									value: false,
									name: "Hidden",
									action: "Hide",
									icon: "fas fa-eye-slash",
									color: "red",
								},
								{
									value: undefined,
									name: "Shown",
									action: "Show",
									icon: "fas fa-eye",
									color: "green",
								},
							],
						},
						{
							key: "hide_death_saves",
							entity: "player",
							name: "Death Saves",
							icon: "fas fa-skull-crossbones",
							info: "Players can see the death saves/fails of other players.",
							options: [
								{
									value: true,
									name: "Hidden",
									action: "Hide",
									icon: "fas fa-eye-slash",
									color: "red",
								},
								{
									value: undefined,
									name: "Shown",
									action: "Show",
									icon: "fas fa-eye",
									color: "green",
								},
							],
						},
					],
				},
			},
		};
	},
	computed: {
		...mapGetters(["userSettings"]),
		settings() {
			return this.userSettings.track || {};
		},
	},
	methods: {
		...mapActions(["setDrawer", "update_settings", "set_default_settings"]),
		setSetting(sub_category, type, value) {
			this.update_settings({
				category: "track",
				sub_category,
				type,
				value,
			});
		},
		selected(value, current) {
			return value === current;
		},
		displaySetting(type, key, value) {
			let options = this.types[type].type_settings.find((item) => item.key === key).options;
			return options.find((item) => item.value === value);
		},
	},
};
</script>

<style lang="scss" scoped>
.q-field__control {
	.q-item {
		width: 100%;
	}
}
.q-item.no-wrap {
	flex-wrap: wrap;
}
</style>
