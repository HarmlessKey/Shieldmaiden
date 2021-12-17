<template>
	<div class="content">
		<div>
			<h1>Documentation</h1>
			<p>Here we will explain why we made certain choices and how we solved some issues we came across. If you wonder why some actions work a certain way, you will probably find answers here.
			</p>
			
			<div>
				<section id="campaigns">
					<hk-card header="Campaigns">
						<div class="card-body">
							<p>
								<b>Why do I have to make a campaign?</b><br/> 
								Since it's very possible someone is running multiple campaigns, we decided creating one is mandatory. 
								This way your encounters are grouped under a campaign, so when running multiple campaigns there is some structure to it.
							</p>

							<p>
								<b>Why do I have to add players to my campaigns?</b><br/>
								We keep track of all sorts of information of a player under the campaign. 
								Below is a list of everything that is saved under the campaign. 
								Removing a player from the campaign will result in a reset of all this info.
							</p>

							Player information saved under the campaign
							<ul>
								<li>Current Hit Points</li>
								<li>Temporary Hit Points</li>
								<li>Hit Point modifiers</li>
								<li>Armor Class Bonus</li>
								<li>Campaign wide damage meters</li>
							</ul>

							<p>We store Hit point information under the campaign and not under an encounter, so it is not reset between encounters.</p>
						</div>
					</hk-card>
				</section>

				<section id="players">
					<hk-card header="Players">
						<div class="card-body">
							<p>
								Our app is not aimed at character sheets, this is why the options for players are limited. 
								For players you only have to add the information essential for running an encounter in our app, 
								a name, maximum hit points and armor class. We do give you the option to add ability scores, but that is optional.
								</p>
						</div>
					</hk-card>

				</section>

				<section id="npcs">
					<hk-card header="NPC's">
						<div class="card-body">
							<p>
								<b>Why call them NPC's?</b><br/>
								We decided to name it NPC's and not monsters, because friendlies can be added as well. 
								Say your group has recruited a mighty hero to fight with them in an upcoming battle, 
								you can add this hero as an NPC that you can control and keep track of during encounters.
								</p>

							<p>
								<b>Why can't I find the monster I'm looking for?</b><br/>
								We're not allowed to use anything outside of the SRD, so if you can't find your monster, it's probably because of that. 
								We only stored the monsters from the SRD in our database, but we do give you the opportunity to create your own.
								</p>
						</div>
					</hk-card>
				</section>

				<section id="encounters">
					<hk-card header="Encounters">
						<div class="card-body">
							<p>
								Encounters is what our app is all about. Here we'll talk about creating one, 
								if you want to know what happens when running an encounter check the section <a href="#run-encounter">Run Encounter</a>.
							</p>
							<p>There are some steps for creating an encounter. Some are optional and some are not.</p>

							<p><b>Name</b><br/>
								Every encounter of course needs to have a name.
							</p>

							<p>
								<b>Background</b><br/>
								A background image can be added to an encounter, this image is shown on the background (if you choose so) when you run the encounter. 
								It is also shown on the background of the public initiative list where your players can follow your active encounter. 
								It is mainly for this purpose we added the option of adding a background. It can really give some atmosphere to your encounters.
							</p>

							<p>
								<b>Loot</b><br/>
								Loot is nothing more than a reminder that shows when you finish an encounter. 
								You probably have thought of some loot your players might find if they manage to defeat your encounter. 
								This will give you a simple overview when the encounter has ended. 
								In your <router-link to="/settings">settings</router-link> you can even choose to you show it to your party on the public initiative list. 
								This is set as hidden by default though.
							</p>

							<p>
								<b>Players and NPC's</b><br/>
								Every encounter needs entities to fight each other. Below we'll talk about how these entities are stored in an encounter.
							</p>
							<p>
								<b>Players</b><br/>
								When you add a player to an encounter, only their ID is copied to that encounter. 
								We keep track of Hit Points and Armor Class of a player under the campaign. 
								We do this so hit points don't reset after an encounter.
							</p>
							<p><b>NPC's</b><br/>
								Adding an NPC copies some of the values to the encounter. 
								Name, maximum hit points and armor class are tracked under the encounter, not under the NPC. 
								This is done so manipulations can be made without changing the original values. You can choose how the Hit Points of an NPC are set. 
								We can either set the average of their hit dice, or we can roll the hit dice for you.
								When we roll the hit points, we add the amount of dice times the constitution modifier. 
								So for a monster with 2d8 hit dice and a constitution modifier of 2 we roll 2 d8 and add 4.
							</p>
						</div>
					</hk-card>
				</section>

				<section id="run-encounter">
					<hk-card header="Running an encounter">
						<div class="card-body">
							<h2 id="run-encounter-set-in" class="pt-5">Setting initiatve</h2>
							<p>
								Nothing special going on here. We decided that initiative for players cannot be rolled. 
								Players usually like to roll themselves and you as a DM will have to enter their rolls manually.
							</p>

							<p>
								When rolling for an NPC, we add their dexterity modifier to the roll. 
								When rolling some NPC's as a group, we use the lowest dexterity as the modifier.
							</p>

							<p>
								In the view of setting the initiative, players and NPC's alike can be set to either idle or active. 
								The idle entities will not enter the encounter until you want them to. 
								This way you can create an encounter with waves of monsters and add these waves whenever you want. 
								Or maybe you have a monster that can summon some sort of entity, you can already add these to the encounter, but just set them to idle.
								Check the section on <a href="#run-encounter-track-in">tracking initiative</a> to see how we handle adding entities during an encounter.<br/>
								Instead of setting an NPC to idle, you can also choose to set one to hidden. A hidden entity is part of the initiative rotation, 
								but it will not show up on the screen the players can see. This way you can have NPC’s ready to enter combat whenever you want, 
								but your players won’t notice until you unhide them.
							</p>

							<h2 id="run-encounter-track-in" class="pt-5">Tracking initiative</h2>
							<p>
								To decide who's turn it is during the encounter we use turns and rounds. 
								The amount of turns is based on the amount of active entities during a round. 
								Based on the initiative of the active entities during the round and the current turn, it is calculated who's turn it is. 
								So if there are three entities within an encounter, one with an initiative of 10, one with 8 and the other with 6, at turn one, 
								the entity with 10 is up, at turn two the entity with 8 and so forth.
							</p>
							<p>
								This causes some problems. We will explain why and how we solved it. 
								Because we set the order based on turns, adding and removing entities during a round messes up the order. 
								For instance if a player would use a spell to summon or conjure a companion to fight for them. 
								Adding it during a round might reorder some of the entities. It might even be that it suddenly is the turn of the summoned companion. 
								If the entity that is currently up has 8 as initiative and it is turn one, 
								the added monster would suddenly be up if it rolled and initiative of 9 or higher. 
								With an initiative of 7 it might be up next, postponing other entities turns, which is not how the rules state it works. 
								To solve this issue we do not immediately add entities to the mix. 
								Since they don't get a turn during the round they are summoned/added, we add them the next round. 
								First we put them in the idle list where they can be tagged to be added the next round. 
								As soon as the new round starts, all the tagged entities will be added to the active list and a new order is calculated for this round.
							</p>

							<h2 class="pt-5" id="run-encounter-manual">Manual damage and healing</h2>
							<p>
								Note: all damage and healing done will be saved in the combat log, so you can keep constant track of what happened and even undo mistakes.
							</p>
							<p>
								First off, the basics. When doing manual damage and healing, you input a number and either click on <u>damage</u> or <u>healing</u>. 
								The amount submitted will be either added or subtracted from the current hit points of the selected target. 
								If the damage is higher than the target's current hit points, their hit points will be set to zero. 
								The rest amount will be set as an overkill in the combat log. When the healing is higher than the target's maximum hit points, 
								the current hit points will be set to equal the maximum. The rest amount will be set as overhealing in the combat log.
							</p>
							<p>
								<b>Dead or Down.</b><br/> 
								If the target is a player and the overkill was equal to or higher than the target's maximum hit points, they will be marked as dead. 
								If a player reaches zero hit points they will be prompted to roll a death saving throw when their turn comes up. 
								With one click you can set if the player succeeded or failed their death save. 
								When a player is down and they either receive healing, or they are stabilized (a single click of a button lets you stabilize a player), 
								their death saves are automatically reset. If a player that is down or stabilized receives damage, 
								they fail one death save (two if it is a critical hit). This happens only if you have the automate setting on.<br/>
								NPC's that reach zero hit points are handled differently. When an NPC reaches zero hit points they will be marked as down. 
								As soon as the next round begins, the down NPC's will be moved to a seperate "down list" and they won't be in the turn order anymore. 
								For an explanation on why it is not immediately moved to the "down list" list, check the section on 
								<a href="#run-encounter-track-in">tracking initiavive</a>.
							</p>

							<p>
								<b>Type of damage.</b><br/> 
								At this moment we do need to keep track of the type of damage, because we are not able to when you roll the damage of an action. 
								Check the documentation on <a href="#run-encounter-select">roll damage</a> for more information.</p>
							<p>
								<b>Critical hits.</b><br/> 
								When you input manual damage, you can select if it was a critical hit. This has no effect on the amount you submitted. 
								We don't divide it by two or do any sort of manipulation to it, it's up to you input the right amount of damage. 
								The critical hit checkbox at manual damage has only two purposes. 
								First to keep track of in the combat log and second to let a player that is down automatically fail two death saving throws.<br/>
								When you roll damage, if it is a critical hit, we double the damage dice rolls. 
								So if the roll is 2d8 + 6 and you rolled a 6 and a 2 (total of 8), we make that 16 damage and then we add the + 6, 
								resulting in 22 damage for that attack.
							</p>

							<p><b>Temporary Hit Points.</b><br/> 
								During an encounter entities can be given temporary hit points through the edit function. 
								Temporary hit points are handled as the rules describe. They serve as an extra pool for damage, 
								but healing will not be put in the temporary pool. When damage received is larger than the temporary hit points pool, 
								the damage carries over into the current hit points of the target.
							</p>

							<p><b>Transformed targets.</b><br/> 
								If a target is transformed, like a druid in Wild Shape, they get new hit points and a new armor class. 
								The new hit points are handled as the rules describe for Wild Shape and Polymorph. 
								Damage and healing will be done in the new health pool, and when damage is higher than the current hit points in the transformation, 
								the rest damage is carried over into the old current hit points. 
								In this last case the transformation is automatically removed from the target and it falls back into its old form.
							</p>

							<h2 class="pt-5" id="run-encounter-select">Roll damage abilities</h2>
							<p>
								When the current entity is an NPC, you can choose to roll the attacks automatically. 
								A d20 plus their to hit modifier and the damage of the attack will be rolled at the same time. 
								A notification will pop up showing you the results of the roll and asking you if and how you want to apply the damage. 
								If you count it as a hit, the damage is handled exactly the same as manual damage. You can also choose to either double or half the damage. 
								When halved, the outcome is rounded down.<br/> We allow you to roll with advantage or disadvantage. 
								In this case we roll twice and show either the highest or lowest depending on what you chose. 
								Only one result is shown, but we do show if it was rolled with advantage or disadvantage.
							</p>

							<p>
								<b>Type of damage.</b><br/>
								Because of how we stored the monsters in our database it is currently not possible to keep track of the type of damage. 
								We do plan to add this feature in the future.
							</p>

							<h2 class="pt-5" id="run-encounter-log">Combat Log</h2>
							<p>
								Some actions in an encounter are saved in the combat log. It is stored in your browser and not in our database. 
								The log shows who did damage or healing and whom they did it to. 
								The log allows you to keep track of what happened during the encounter and to undo mistakes you made. 
								The last entry in the log can always be undone, the health will be restored to the status it was before and the log entry will be removed. 
							</p>

							<h2 class="pt-5" id="run-encounter-meters">Damage Meters</h2>
							<p>
								The damage meters are stored as a total number for each entity. 
								If the damage done was higher than the targets current hit points, we store the rest damage as an overkill. 
								Healing for more than a target's maximum hit points results is stored as overhealing.
							</p>
						</div>
					</hk-card>
				</section>
			</div>
		</div>
	</div>
</template>

<script>

	export default {
		name: 'Documentation',
		metaInfo: {
			title: 'Documentation'
		},
	}
</script>

<style lang="scss" scoped>

.container {
	padding-top:20px;
	line-height: 25px;
	font-size: 15px; 
	font-weight: lighter;

	#sidebar {
		.navbar {
			.nav-link {
				width: 100% !important;
				&:hover, &.active {
					background: none;
					color: $blue !important;
				}
			}
		}
	}

	.container-fluid {
		height: calc(100vh -50px);
		overflow-y: scroll;
		padding-bottom: 50px !important;

		&::-webkit-scrollbar { 
			display: none; 
		}
	}

	section {
		padding-top: 55px;

		.card {
			margin: 0 !important;
		}
	}
	span.anchor {
		display: block;
		position: relative;
		top: -50px;
		visibility: hidden;
	}

	@media only screen and (max-width: 1200px) {
		#hasSide {
			padding-left: 0;
		}
		#sidebar {
			display: none;
		}
	}
}

</style>