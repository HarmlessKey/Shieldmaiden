<template>
	<div>
		<hk-card>
			<div slot="header" class="card-header">
				<h1>Creating a D&D Combat Tracker</h1>
			</div>
			<div class="card-body">
				<p>
					Shieldmaiden is created by two experienced Dungeons & Dragons players from Amsterdam. 
					We were missing an encounter tracker that tended to all our needs, so we decided to build one ourselves.<br/> 
					After some positive feedback from our fellow D&D players, we decided to share it with the public in Februari 2019.<br/>
					Since then we've been improving and expending a lot and this is still going on.
				</p>
				<h3 class="mb-5">
					We hope you get as much use out of Shieldmaiden as we do.
				</h3>
				<h2 class="written">Meet the team</h2>
				<hk-card-deck class="mb-3">
					<hk-card header="The Harmless">
						<div class="card-body sheet">
							<div class="character harm">
								<div class="d-flex justify-content-start items-center">
									<div class="img" :style="{'background-image': 'url(' + require('src/assets/_img/harm.jpg') + ')'}"></div>
									<div>
										Harm Manders<br/>
										<small><i aria-hidden="true" class="neutral-3">Male human developer</i><br/>
										<i>Level {{ getAge('1992-03-29') }}</i></small>
									</div>
								</div>
								<div class="initiative text-center">
									Proficiency 
									<div class="score">+5</div>
								</div>
							</div>
							<div class="row q-col-gutter-md">
								<div class="col">
									<h3>Abillity Scores</h3>
									<ul class="abillities">
										<li>Assembly <span class="score">10</span></li>
										<li>CSS <span class="score">18</span></li>
										<li>JS <span class="score">15</span></li>
										<li>PHP <span class="score">12</span></li>
										<li>Python <span class="score">19</span></li>
										<li>R <span class="score">11</span></li>
									</ul>
								</div>
								<div class="col">
									<h3>Skills</h3>
									<ul class="skills">
										<hk-roll 
											v-for="{skill, score, proficient} of skills.harm"
											:key="skill"
											:roll="{
												d: 20, 
												n: 1, 
												m: score,
												title: `${skill} check`,
												entity_name: 'Harm', 
												notify: true
											}"
										>
											<li>
												<span class="skill">
													<i aria-hidden="true" :class="proficient ? 'fas' : 'far'" class="fa-circle mr-1" /> 
													{{ skill }}
												</span> 
												<span class="score">
													{{ score > 0 ? `+${score}` : score }}
												</span>
											</li>
										</hk-roll>
									</ul>
								</div>
							</div>
						</div>
					</hk-card>
					<hk-card header="The Key">
						<div class="card-body sheet">
							<div class="character key">
								<div class="d-flex justify-content-start items-center">
									<div class="img" :style="{'background-image': 'url(' + require('src/assets/_img/key.jpg') + ')'}"></div>
									<div>
										Key Roos<br/>
										<small><i aria-hidden="true" class="neutral-3">Male human developer</i><br/>
										<i>Level {{ getAge('1987-06-11') }}</i></small>
									</div>
								</div>
								<div class="initiative text-center">
									Proficiency 
									<div class="score">+5</div>
								</div>
							</div>
							<div class="row q-col-gutter-md">
								<div class="col">
									<h3>Abillity Scores</h3>
									<ul class="abillities">
										<li>Assembly <span class="score">9</span></li>
										<li>CSS <span class="score">18</span></li>
										<li>JS <span class="score">18</span></li>
										<li>PHP <span class="score">14</span></li>
										<li>Python <span class="score">10</span></li>
										<li>R <span class="score">11</span></li>
									</ul>
								</div>
								<div class="col">
									<h3>Skills</h3>
									<ul class="skills">
										<hk-roll 
											v-for="{skill, score, proficient} of skills.key"
											:key="skill"
											:roll="{
												d: 20, 
												n: 1, 
												m: score,
												title: `${skill} check`,
												entity_name: 'Key', 
												notify: true
											}"
										>
											<li>
												<span class="skill">
													<i aria-hidden="true" :class="proficient ? 'fas' : 'far'" class="fa-circle mr-1" /> 
													{{ skill }}
												</span> 
												<span class="score">
													{{ score > 0 ? `+${score}` : score }}
												</span>
											</li>
										</hk-roll>
									</ul>
								</div>
							</div>
						</div>
					</hk-card>
				</hk-card-deck>
			</div>
		</hk-card>


		<hk-card header="Special thanks">
			<div class="card-body text-center">
				<h2 class="written">Patrick Teunissen</h2>
				<h3>For designing our logo!</h3>
				<p class="mb-4">Patrick was nice enough to lend us his time and design the awesome logo for us.<br/>We couldn't be happier!</p>
				<div class="row q-col-gutter-md">
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../../assets/_img/logo/logo-icon-green.svg"/>
					</div>
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../../assets/_img/logo/logo-icon-blue.svg"/>
					</div>
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../../assets/_img/logo/logo-icon-red.svg"/>
					</div>
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../../assets/_img/logo/logo-icon-orange.svg"/>
					</div>
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../../assets/_img/logo/logo-icon-cyan.svg"/>
					</div>
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../../assets/_img/logo/logo-icon-yellow.svg"/>
					</div>
				</div>
			</div>
		</hk-card>
	</div>
</template>

<script>
	export default {
		name: 'home',
		data() {
			return {
				skills: {
					harm: [
						{
							skill: "Bug creation",
							score: 5,
							proficient: true
						},
						{
							skill: "Bug fixing",
							score: 2
						}
					],
					key: [
						{
							skill: "Complaining",
							score: 8,
							proficient: true
						},
						{
							skill: "Guitar",
							score: 1
						},
						{
							skill: "Drinking",
							score: 4
						},
						{
							skill: "Sleeping",
							score: -2
						},
					]
				}
			}
		},
		methods: {
			getAge(dateString) {
				var today = new Date();
				var birthDate = new Date(dateString);
				var age = today.getFullYear() - birthDate.getFullYear();
				var m = today.getMonth() - birthDate.getMonth();
				if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
						age--;
				}
				return age;
			}
		},
	}
</script>

<style lang="scss" scoped>
		h1 {
			font-size: 25px;
		}

		p {
			font-size: 17px;
			line-height: 30px;
			margin-bottom: 40px;
		}

		.icon {
			width: 100px;
		}
		.written {
			font-family: $text-written;	
			font-size: 30px;
		}

		.hk-card {
			.sheet {
				.character {
					display: flex;
					justify-content: space-between;
					border: solid 1px $neutral-5;
					padding: 10px;
					border-radius: $border-radius;
					align-items: center;
					background-color: $neutral-9;
					margin-bottom: 20px;

					.img {
						border: solid 1px $neutral-2;
						width: 80px;
						height: 80px;
						background-position: center top;
						background-size: cover;
						margin-right: 20px;
						border-radius: $border-radius-small;
						filter: grayscale(100%);
					}
					.initiative {
						padding-right: 10px;
						.score {
							margin-left: -10px;
							font-size: 40px;
							line-height: 40px;
							font-family: $text-written;	
						}
					}
				}

				ul {
					padding: 0;
					list-style: none;


					.advantage {
						.score {
							color: $green;
						}
					}
					.disadvantage {
						.score {
							color: $red;
						}
					}
					&.skills {
						li {
							display: flex;
							justify-content: space-between;
							padding: 5px 8px;
							line-height: 20px;
							background-color: $neutral-7;
							margin-bottom: 2px;
							cursor: pointer;
							user-select: none;

							.skill {
								font-size: 13px;
							}
							.score {
								font-family: $text-written;	
							}
						}
					}
					&.abillities {
						li {
							display: flex;
							justify-content: space-between;
							text-transform: uppercase;
							line-height: 40px;
							margin-bottom: 2px;
							background-color: $neutral-8;
							padding-left: 10px;

							span.score {
								font-size: 25px;
								width: 45px;
								text-align: center;
								display: inline-block;
								background-color: $neutral-9;
								font-family: $text-written;	
								// border: solid 1px $neutral-4;
							}
						}
					}
				}
			}
		}
</style>