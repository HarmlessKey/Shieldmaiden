<template>
	<ToolsPage title="Monster Creator" bg_img="monster-creator-header.webp">
		<template v-slot:action_btn="{ btn_classes }">
			<q-btn
				color="primary"
				:class="btn_classes"
				no-caps
				push
				to="/tools/monster-creator/create-monster"
				>Create custom monster</q-btn
			>
		</template>

		<p>
			With our monster creator you can create stat blocks for custom monsters that you can use in
			our <router-link to="/tools/combat-tracker">combat tracker</router-link>.
		</p>

		<section>
			<h2>Actions</h2>
			<p>
				Advanced actions that can be rolled with one click can easily be created for a monster.<br />
				Different types of damage can be added as separate rolls and this allows us to apply
				different damage types separately.
			</p>
			<p>
				If you click the button below, you roll the action from image. The example roll is a
				versatile action, which means it can be rolled in 2 ways. In this case you can either
				perform the attack 1-handed or 2-handed. The damage rolls will be slightly different for
				both options.<br />
				Since this example is a weapon attack, it can be rolled with
				<strong class="green">Advantage</strong> or <strong class="red">Disadvantage</strong>. When
				clicking on the option you want to roll, hold [shift] to roll with advantage or hold [ctrl]
				to roll with disadvantage.
			</p>

			<p>
				It is very simple to create actions like these yourself, just fill in a few form fields in
				the monster creator.
			</p>

			<q-img
				class="action"
				src="~assets/_img/tools/monster-creator/monster-action.png"
				alt="Spear attack action"
				fit="contain"
			>
			</q-img>
			<hk-roll-action :action="action">
				<button class="btn full-width">
					<i aria-hidden="true" class="fas fa-dice-d20" />
					Roll example action
				</button>
			</hk-roll-action>
		</section>

		<section class="mt-5">
			<div>
				<h2>Resistances and Vulnerabilities</h2>
				<p>
					You can define what types of damage the monster is <em>vulnerable</em>,
					<em>resistant</em> or <em>immune</em> to.<br />
					When you apply damage to the monster in our combat tracker, the amount is automatically
					adjusted based on these resistances. When you apply 5 cold damage to a monster that is
					vulnerable to this damage type, the damage is doubled, resulting in 10 frost damage.
				</p>
			</div>
			<q-img
				class="res-vul"
				src="~assets/_img/tools/monster-creator/resistances-vulnerabilities.png"
				alt="Monster creator resistances and vulnerabilities form"
				fit="contain"
			/>
		</section>

		<section class="mt-5">
			<h2>Spellcasters</h2>
			<p>
				In combination with our
				<router-link to="/tools/spell-creator">spell creator</router-link> you can create powerful
				<strong>spellcasters</strong> that are easy to use in our combat tracker. Unleashing magic
				users on your party can be a pain for you as a DM, but with our combined tools that is no
				longer the case. Spell slots are tracked for you and casting a spell is as simple as using
				any other monster action in Shieldmaiden.
			</p>
		</section>

		<section class="mt-5">
			<h2>Share your creations</h2>
			<p>
				Our monster creator also makes it easy to share your custom monsters with other dungeon
				masters. You can save your monsters to your library if you have an account, export them to
				share with others, or import monsters created by other Shieldmaiden users.<br />
				If you're a content creator you can provide your followers with monsters that they can
				directly use in Shieldmaiden.
			</p>
		</section>

		<section class="mt-5">
			<h2>AI monster generation</h2>
			<em class="d-block mb-3">You can't spell Shieldmaiden without AI</em>
			<p>
				Our AI monster generator will generate monsters from any description you provide.<br />
				You can either provide a short descriptive prompt and let the AI go wild, or you can give
				extensive details and be in more control on what kind of monster you get back.
			</p>
			<p>
				The generated monster is fully operational in our application, with rollable actions and
				accurate Challenge Rating for your party.
			</p>
		</section>

		<em>To save a monster, you need an account, but you can always download your creations.</em>
	</ToolsPage>
</template>

<script>
import { mapActions } from "vuex";
import { dice } from "src/mixins/dice.js";
import ToolsPage from "src/components/ToolsPage.vue";

export default {
	name: "ToolsMonsterCreator",
	components: {
		ToolsPage,
	},
	meta() {
		return {
			meta: {
				twitterImage: {
					name: "twitter:image",
					content: require(`assets/_img/meta/shieldmaiden-monster-creator.png`),
				},
				ogImage: {
					property: "og:image",
					content: require(`assets/_img/meta/shieldmaiden-monster-creator.png`),
				},
				ogImageAlt: {
					property: "og:image:alt",
					content: "Shieldmaiden Monster Creator",
				},
			},
		};
	},
	mixins: [dice],
	data() {
		return {
			action: {
				options: ["1-handed", "2-handed"],
				action_list: [
					{
						attack_bonus: 5,
						type: "melee_weapon",
						rolls: [
							{
								damage_type: "piercing",
								dice_count: 1,
								dice_type: 6,
								fixed_val: 3,
								miss_mod: 0,
								options: {
									"2-handed": {
										dice_type: 8,
									},
								},
							},
							{
								damage_type: "fire",
								dice_count: 1,
								dice_type: 4,
								miss_mod: 0,
							},
						],
					},
				],
				name: "Burning Spear",
				reach: 5,
			},
		};
	},
	methods: {
		...mapActions(["setActionRoll"]),
		roll(e, action, versatile) {
			const config = {
				type: "monster_action",
				versatile,
			};
			this.setActionRoll(this.rollAction(e, action, config));
		},
	},
};
</script>

<style lang="scss" scoped>
.q-img {
	display: block;
	margin: 30px auto;
	width: 100%;

	:deep(.q-img__content) {
		> div {
			background: none;
		}
	}
	&.res-vul {
		width: 50%;
		max-width: 300px;
	}
	&.action {
		max-width: 600px;
		cursor: pointer;
	}
}
</style>
