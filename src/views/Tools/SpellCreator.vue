<template>
	<ToolsPage title="Spell Creator" bg_img="spells-tool-header.png">
		<template v-slot:action_btn="{ btn_classes }">
			<q-btn
				color="primary"
				:class="btn_classes"
				no-caps
				push
				to="/tools/spell-creator/create-spell"
			>
				Create custom spell
			</q-btn>
		</template>

		<section class="mt-4">
			<p>
				Our spell creator lets you create custom spells with actions that can be rolled with one
				click.
			</p>
		</section>

		<section class="mt-4">
			<h2>Scaling</h2>
			<p>
				The actions of your spell change depending on caster level, or at what level the spell is
				casted. Rolls will automatically scale when you cast the spell with a higher lever character, or using a higher spell slot.
			</p>

			<hk-popover header="Blight (phb 219)">
				<button class="btn bg-neutral-5 btn-block">Cast Blight</button>
				<template #content>
					<div class="caster__levels">
						<div
							class="level"
							:class="{
								selected: cast_level === i,
								disabled: i < blight.level,
							}"
							v-for="i in 9"
							:key="i"
							@click="blight.level <= i ? cast_level = i : null"
						>
							{{ i }}
						</div>
					</div>
					<hk-roll-action :action="blight" type="spell" :cast-level="cast_level">
						<button class="btn btn-block">Cast at level {{ cast_level }}</button>
					</hk-roll-action>
				</template>
			</hk-popover>
		</section>

		<section class="mt-4">
			<h2>Spellcasting monsters</h2>
			<p>
				You can combine your custom spells with the monsters you've made in Harmless Key to create
				powerful spellcasters that are easy to use in our
				<router-link to="/tools/combat-tracker">combat tracker</router-link>.
			</p>
		</section>

		<section class="mt-4">
			<h2>Share your creations</h2>
			<p>
				Our spell creator also makes it easy to share your custom spells with other dungeon masters
				and players. You can save your spells to your library if you have an account, export them to
				share with others, or import spells created by other Harmless Key users.<br />
				If you're a content creator you can provide your followers with spells that they can
				directly use in Harmless Key.
			</p>
		</section>
	</ToolsPage>
</template>

<script>
import ToolsPage from "src/components/ToolsPage.vue";

export default {
	name: "ToolsSpellCreator",
	components: {
		ToolsPage,
	},
	data() {
		return {
			blight: {
				actions: [
					{
						name: "Damage roll",
						rolls: [
							{
								damage_type: "necrotic",
								dice_count: 8,
								dice_type: 8,
								save_fail_mod: 0.5,
								scaling: [
									{
										dice_count: 1,
										dice_type: 8,
										level: 1
									}
								]
							}
						],
						save_ability: "constitution",
						type: "save"
					}
				],
				level: 4,
				name: "Blight",
				scaling: "spell_scale",
			},
			cast_level: 4,
		};
	},
	methods: {},
};
</script>

<styles lang="scss" scoped>
.caster__levels {
	display: flex;
	justify-content: center;
	column-gap: 3px;
	margin-bottom: 10px;

	.level {
		width: 30px;
		height: 30px;
		line-height: 30px;
		text-align: center;
		cursor: pointer;
		background-color: $neutral-8;
		user-select: none;

		&.selected {
			background-color: $blue;
			color: $neutral-1;
		}
		&.disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}
}
</styles>