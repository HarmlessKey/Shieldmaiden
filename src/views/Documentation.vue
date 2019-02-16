<template>
	<div id="hasSide" class="container">
		<div id="sidebar">
			<b-navbar v-b-scrollspy>
				<b-nav>
					<b-nav-item href="#campaigns">Campaigns</b-nav-item>
					<b-nav-item href="#players">Players</b-nav-item>
					<b-nav-item href="#npcs">NPC's</b-nav-item>
					<b-nav-item href="#encounters">Encounters</b-nav-item>
					<b-nav-item href="#run-encounter">Run Encounter</b-nav-item>
					<b-nav>
						<b-nav-item href="#run-encounter-set-in">Setting Initiative</b-nav-item>
						<b-nav-item href="#run-encounter-track-in">Track Initiative</b-nav-item>
						<b-nav-item href="#run-encounter-manual">Manual Damage</b-nav-item>
						<b-nav-item href="#run-encounter-select">Roll Damage</b-nav-item>
						<b-nav-item href="#run-encounter-log">Combat Log</b-nav-item>
						<b-nav-item href="#run-encounter-meters">Damage Meters</b-nav-item>
					</b-nav>
				</b-nav>
			</b-navbar>
		</div>
		<div class="container-fluid">
			<h1>Documentation <span class="gray-hover">(INCOMPLETE)</span></h1>
			<p>Here we will explain why we made certain choices and how solved some issues we came across. 
				If you wonder why some actions work a certain way, you will probably find answers here.
			</p>
			
			<div>
				<section id="campaigns">
					<b-card header="Campaigns">
						<p><b>Why do I have to make a campaign?</b> Since it's very possible someone is running multiple campaigns, 
						we decided creating one is mandatory. This way your encounters are grouped under a campaign, so when running multiple campaigns there is some structrure to it.</p>

						<p><b>Why do I have to add players to my campaigns?</b> To make it easier to quicly add players to your encounters 
						we made it so that players have to be added to a campaign. When creating an encounter under a campaign, 
						only the players of this campaign will show up and they can be quicly added with one click of a button.</p>
					</b-card>
				</section>

				<section id="players">
					<b-card header="Players">
						<p>Our app is not aimed at character sheets, this is why the options for players are limited. 
							For players you only have to add the information essential for running an encounter, 
							a name, maximum hit points and an armor class.
							We do give you the option to add ability scores, but that is optional.</p>

						<p>Players have to be added to a campaign and only the players in the campaign can be added to encounters.
							We did this so players can be added to encounter with a single click of a button.
						</p>
					</b-card>

				</section>

				<section id="npcs">
					<b-card header="NPC's">
						<p><b>Why call them NPC's?</b><br/> We decided to name it NPC's and not monsters, because friendlies can be added aswell. 
						Say your group has recruited a mighty hero to fight with them in an upcomming battle, 
						you can add this hero as an NPC that you can control and keep track of during the encounter.</p>

						<p><b>Why can't I find the monster I'm looking for?</b> We're not allowed to use anything outside of the SRD, so if you can't find your monster, 
						it's probably because of that. We only stored the monsters from the SRD in our database, but we do give you the opportunity to create your own.</p>
					</b-card>
				</section>

				<section id="encounters">
					<b-card header="Encounters">
						<p>Encounters is what our app is all about. Here we'll talk about creating one, 
							if you want to know what happens when running an encounter check the section <a href="#run-encounter">Run Encounter</a>.
						</p>
						<p>There are some steps for creating an encounter. Some are optional and some are not.</p>

						<p><b>Name</b><br/>
							Every encouner of course needs to have a name. 
						</p>

						<p><b>Background</b><br/>
							A background image can added to an encounter, this image is shown on the background (if you choose so) when you run the encounter. 
							It is also shown on the background of the track encounter screen where your players can follow your active encounter. 
							It is mainly for this purpose we added the option of adding a background. It can really give some atmosphere to your encounters.
						</p>

						<p><b>Loot</b><br/>
							Loot is nothing more than a reminder that shows when you finish an encounter. 
							You probably have thought of some loot your players might find if they manage to defeat your encounter. 
							This will give you a simple overview when the encounter has ended. 
							In your <router-link to="/settings">settings</router-link> you can even choose to you show it to your party on the track encounter screen. This is set as hidden by default though.
						</p>

						<p><b>Players and NPC's</b><br/>
							Every encounter needs entities to fight each other. Below we'll talk about how these entities are stored in an encounter.
						</p>
						<p><b>Players</b><br/>
							When you add a player the current hit points are set to the maximum. 
							We keep track of current hit points in the encounter, not under the player itself.
						</p>
						<p><b>NPC's</b><br/>
							Adding an NPC copies the some of the values to the encounter. 
							Name, maximum hit points and armor class are kept track of in the encounter, not under the NPC.
							This is done so manipulations can be made without changing the original values.<br/>
							You can choose how the hit points of an NPC are set. 
							We can either set the average of their hit dice, or we can roll the hit dice for you. 
							You can choose how you want it in your <router-link to="/settings">settings</router-link>. 
							When we roll the hit points, we add the amount of dice times the constitution modifier. 
							So for a monster with 2d8 hit dice and a constition modifier of 2 we roll 2 d8 and add 4.
						</p>
					</b-card>
				</section>

				<section id="run-encounter">
					<b-card header="Running an encounter">
					<h2 id="run-encounter-set-in" class="pt-5">Setting initiatve</h2>
						<p>Nothing special going on here. We decided that initiative for players cannot be rolled. 
							Players usualy like to roll themselves and you as a DM will have to enter their rolls manualy.</p>

						<p>When rolling for an NPC, we add their dexterity modifier to the roll. When rolling some NPC's as a group, 
							we use the lowest dexterity as the modifier.</p>

						<p>In the view of setting the initative, players and NPC's alike can be set to either <u>idle</u> or <u>active</u>. 
							The idle entities will not enter the encounter untill you want them to. This way you can create an encounter with waves of monsters and add the waves whenever you want. 
							Or maybe you have a monster that can summon some sort of entity, 
							you can allready add them to the encounter, but just set them to idle. 
							Check the section on <a href="#run-encounter-track-in">tracking initiative</a> to see how we handle adding entities during an encounter.</p>

						<h2 id="run-encounter-track-in" class="pt-5">Tracking initiative</h2>
						<p>To decide who's turn it is during the encounter we use turns and rounds. 
							The amount of turns is based on the amount of active entities during a round. 
							Based on the initiative of the active entities during the round and the current turn, it is calculated who's turn it is.
							So if there are three entities within an encounter, one with an initiative of 10, 
							one with 8 and the other with 6, at turn one, the entity with 10 is up, at turn twho the entity with 8 and so fort.
						</p>
						<p>
							This causes some problems. We will explain why and how we solved it.
							Because we set the order based on turns, adding and removing entities during a round messes up the order. 
							For instance if a player would use a spell to summon or conjure a companion to fight for them. 
							Adding it during a round might reorder some of the entities. It might even be that it suddenly is the turn of the summoned companion.
							If the entity that is currently up has 8 as initiave and it is turn one, the added monster would suddenly be up if it rolled and initiave of 9 or higher. 
							With an initiative of 7 it might be up next, posponing other entities turns, which is not how the rules state it works.
							To solve this issue we do not immediately add entities to the mix. Since they don't get a turn during the round they are summoned/added, we add them the next round.
							First we put them in the idle list where they can be tagged to be added the next round. 
							As soon as the new round starts, all the tagged entities will be added to the active list and a new order is calculated for this round.
						</p>

						<h2 class="pt-5" id="run-encounter-manual">Manual damage and healing</h2>
						<p>Note: all damage and healing done will be saved in the combat log, so you can keep constant track of what happened.</p>
						<p>
							First off, te basics. When doing manual damage and healing, you input a number and either click on <u>damage</u> or <u>healing</u>. 
							The amount submitted will be either added or subracted from the current hit points of the selected target.
							If the damage is higher than the target's current hit points, their hit points will be set to zero. 
							The rest amount will be set as an overkill in the combat log. 
							When the healing is higher than the target's maximum hit points, the current hit points will be set to equal the maximum. 
							The rest amount will be set as overhealing in the combat log.
						</p>
						<p>
							<b>Dead or Down.</b><br/> If the target is a player and the overkill was equal to or higher than the target's maximum hit points, they will be marked as <u>dead</u>. 
							If a player reaches zero hit points they will be prompted to roll a death saving throw when their turn comes up. 
							With one click you can set if the player succeeded or failed their death save. 
							When a player is down and they either receive healing, or they are stabilized (a single click of a button let's you stabilize a player), 
							their death saves are automitically reset. 
							If a player that is down or stabilized receives damage, they fail one death save (two if it is a critical hit). 
							This happens only if you have the automate setting on.<br/>
							NPC's that reach zero hit points are handled differently. When an NPC reaches zero hit points they will be marked as down.
							As soon as the next round begins, the down NPC's will be moved to a seperate "down list" and they wont be in the turn order anymore.
							For an explaination on why it is not immediatly moved to the "down list" list, check the section on <a href="#run-encounter-track-in">tracking initiavive</a>.
						</p>

						<p><b>Type of damage.</b><br/> At this moment we do need keep track of the type of damage, 
						because we are not able to when you roll the damage of a action. 
						Check the documention on <a href="#run-encounter-select">roll damage</a> for more information.</p>

						<p><b>Critical hits.</b><br/> When you input manual damage, you can select if it was a critical hit. This has no effect on the the amount you submitted. 
						We don't divide it by two or do any sort of manipulation to it, it's up to you input the right amount of damage. 
						The critical hit checkbox has only two purposes. 
						First to keep track of in the combat log and second to let a player that is down automitically fail two death saving throws.</p>

						<p><b>Temporary Hit Points.</b><br/> During an encounter entities can be given temporary hit points through the edit function. 
							Temporary hit points are handled as the SRD describes. They serve as an extra pool for damage, but healing will not be put in the temporary pool.
							When damage received is larger than the termporary hit points pool, the damage carries over into the current hit points of the target.
						</p>

						<p><b>Transformed targets.</b><br/> If a target is transformed, like a druid in Wild Shape, they get new hit points and a new armor class. 
							The new hit points are handled as the SRD describes for Wild Shape and Polymorph. Damage and healing will be done in the new health pool, 
							and when damage is higher than the current hit points in the transformation, the rest damage is carried over into the old current hit points. 
							In this last case the transformation is automitically removed from the target and it falls back into it's old form.
						</p>

						<h2 class="pt-5" id="run-encounter-select">Roll damage abilities</h2>
						<p>When the current entity is an NPC, you can choose to roll the attacks automatically. 
							A d20 plus their to hit modifier and the damage of the attack will be rolled at the same time. 
							A notification will pop up showing you te results of the roll and asking you if you want to apply the damage or cancel.
							If you apply the damage, it is handled exactly the same as manual damage.
						</p>

						<p><b>Type of damage.</b><br/> Because of how we stored the monsters in our database it is currently not possible to keep track of type of damage. 
						We do plan to add this feature in the future.</p>

						<h2 class="pt-5" id="run-encounter-log">Combat Log</h2>
						<p>
							Some actions in an encounter are saved in the combat log. 

							It is stored in your browser and not in our database. 
							The log shows who did damage or healing and who they did it to. 
							The log allows to keep track of what happened during an encounter and to undo mistakes you made.
							The last entry in the log can always be undone, 
							the health will be restored to the status it was before and the log entry will be removed. 
						</p>

						<h2 class="pt-5" id="run-encounter-meters">Damage Meters</h2>
						<p>
							The damage meters are stored as a total number for each entity.
						</p>
					</b-card>
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
					color: #2c97de !important;
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