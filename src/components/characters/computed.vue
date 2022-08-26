<template>
	<hk-card :header="computed.character_name">
		<div class="card-header" slot="header">
			<div class="image" :style="computed.avatar ? `background-image: url('${computed.avatar}')` : ''">
				<i v-if="!computed.avatar" class="hki-player" aria-hidden="true" />
			</div>
			<div>
				<div class="name truncate">
					<strong>{{ computed.character_name || "Unnamed Character" }}</strong>
				</div>
				<div>
					Level {{ computed.level }} &bull; {{ computed.race.race_name }}
					<template v-if="computed.classes">
						<div v-for="( subclass, index) in classes" :key="`class-${index}`">
						{{ (subclass.level &lt; computed.level) ? `${subclass.level}` : `` }}
						<strong>{{ subclass.name }}</strong>
						<template v-if="subclass.subclass">
							<span class="blue mx-1">&bull;</span>
							<em>{{ subclass.subclass }}</em>
						</template>
						</div>
					</template>
				</div>
			</div>
		</div>
		<q-tabs 
			v-model="tab" 
			dense 
			inline-label 
			no-caps 
			align="justify"
			class="bg-neutral-9"
		>
			<q-tab name="sheet" label="Sheet" />
        <q-tab name="base-json" label="Base" />
        <q-tab name="computed-json" label="Computed" />
		</q-tabs>
		<div class="computed">
			<q-tab-panels v-model="tab" class="bg-transparent" >
				<q-tab-panel name="sheet" class="p-0">
					<div class="stats">
						<div class="armor_class" v-if="computed.armor_class">
							<h6>AC</h6>
							<div class="value">
								{{ computed.armor_class }}
							</div>
						</div>
						<div 
							class="hit_points" 
							@click="setSlide({
								show: true, 
								type: 'slides/characterBuilder/HitPoints',
								data: {
									total: computed.hit_points,
									hit_point_type,
									level: computed.level,
									con_mod: character.sheet ? calcMod(character.sheet.abilities.constitution) : 0,
									modifiers: hp_modifiers,
									classes,
								}
							})
						">
							<h6>HP</h6>
							<div class="value">
								{{ computed.hit_points }}
							</div>
						</div>
						<div class="speed">
							<h6>Speed</h6>
							<div class="value">
								{{ computed.speed }}<span class="ft gray-hover">ft.</span>
							</div>
						</div>
						<div class="initiative">
							<h6>Initiative</h6>
							<div class="value">
								<hk-roll
									tooltip="Roll"
									:roll="{
										d: 20,
										n: 1,
										m: computed.initiative,
										title: 'Initiative roll',
										notify: true,
										advantage: checkAdvantage('initiative')
									}"
								>
									<span class="gray-hover">
										{{ computed.initiative >= 0 ? "+" : "-" }}</span>
										<span 
											class="int"
											:class="Object.keys(checkAdvantage('initiative')).length === 1 ? Object.keys(checkAdvantage('initiative'))[0] : ''"
										>{{ Math.abs(computed.initiative) }}</span>
								</hk-roll>
							</div>
						</div>
					</div>
					<hr>

					<div class="abilities">
						<div v-for="ability in abilities" :key="`score-${ability}`">
							<div class="ability">{{ ability.substring(0, 3) }}</div>
							<div class="mod">
								<hk-roll
									tooltip="Roll"
									:roll="{
										d: 20,
										n: 1,
										m: calcMod(computed.abilities[ability]),
										title: `${ability.capitalize()} check`,
										notify: true,
										advantage: checkAdvantage('abilities', ability)
									}"
								>
									<span class="gray-hover" v-if="calcMod(computed.abilities[ability]) !== 0">
										{{ calcMod(computed.abilities[ability]) > 0 ? "+" : "-" }}</span>
									<span class="int"
										:class="Object.keys(checkAdvantage('abilities', ability)).length === 1 ? Object.keys(checkAdvantage('abilities', ability))[0] : ''"
									>{{ Math.abs(calcMod(computed.abilities[ability])) }}</span>
								</hk-roll>
							</div>
							<div class="score">{{ computed.abilities[ability] || 0 }}</div>
						</div>
					</div>

					<hr>

					<h4>Saving throws</h4>
					<div class="columns">
						<ul class="list">
							<li v-for="({mod, proficient, advantage_disadvantage}, key) in saving_throws" :key="`saving_throw-${key}`" class="pointer">
								<span class="type">
									<i 
										class="mr-2"
										:class="{
											'far fa-circle': !proficient,
											'far fa-dot-circle': proficient
										}"
										aria-hidden="true"
									>
										<q-tooltip anchor="top middle" self="center middle" v-if="proficient">
											Proficient
										</q-tooltip>
									</i>
									{{ key.substring(0, 3).toUpperCase() }}
								</span>
								<span class="value">
									<hk-roll
										tooltip="Roll"
										:roll="{
											d: 20,
											n: 1,
											m: mod,
											title: `${key.capitalize()} save`,
											notify: true,
											advantage: advantage_disadvantage
										}"
									>
										{{ mod >= 0 ? "+" : "-" }}<span class="int"
											:class="Object.keys(advantage_disadvantage).length === 1 ? Object.keys(advantage_disadvantage)[0] : ''"
										>{{ mod }}</span>
									</hk-roll>
								</span>
							</li>
						</ul>
					</div>

					<div>
						<h4>Senses</h4>
						<ul class="list">
							<li v-for="(sense, key) in computed.senses" :key="key">
								<span class="type">
									<i 
										aria-hidden="true"
										class="mr-2"
										:class="{
										'fas fa-eye': key === 'perception',
										'fas fa-search': key === 'investigation',
										'fas fa-lightbulb-on': key === 'insight'
									}" />
									{{ key.capitalize() }}
								</span>
								<span class="value">
									{{ sense }}
								</span>
							</li>
						</ul>
					</div>
				</q-tab-panel>

				<q-tab-panel name="base-json" class="p-0">
					<pre>
						{{ characterState.character }}
					</pre>
				</q-tab-panel>

				<q-tab-panel name="computed-json" class="p-0">
					<pre>
						{{ computed }}
					</pre>
				</q-tab-panel>
			</q-tab-panels>
		</div>
	</hk-card>
</template>

<script>
	import { mapActions } from 'vuex';
	import { general } from 'src/mixins/general.js';
	import { abilities } from 'src/utils/generalConstants';

	export default {
		name: 'CharacterComputed',
		mixins: [general],
		data() {
			return {
				showOverview: false,
				abilities: abilities,
				tab: "sheet"
			}
		},
		inject: ["characterState"],
		computed: {
			computed() {
				return this.characterState.computed_character || {};
			},
			modifiers() {
				return this.characterState.modifierArray || [];
			},
			character() {
				return (this.computed) ? this.computed : {};
			},
			race() {
				return this.characterState.character.race;
			},
			hit_point_type() {
				return this.characterState.character.hit_point_type;
			},
			classes() {
				return this.characterState.character.class.classes;
			},
			avatar() {
				return this.characterState.character.avatar;
			},
			character_name() {
				return this.characterState.character.character_name;
			},
			saving_throws() {
				let saving_throws = {};
				const proficiencies = this.computed.saving_throws.proficiencies || {};
				const bonuses = this.computed.saving_throws.bonuses || {};
				const advantage_disadvantage = (this.computed.advantage_disadvantage) ? this.computed.advantage_disadvantage.saving_throws : {};

				for(const ability of this.abilities) {
					let saving_throw = {};
					let score = this.computed.abilities[ability];
					const proficient = proficiencies.includes(ability);
					const bonus = bonuses[ability] || 0;
					saving_throw.mod = this.calcMod(score) + bonus;

					//Check advantage/disadvantage
					if(advantage_disadvantage) {
						saving_throw.advantage_disadvantage = (advantage_disadvantage[ability]) ? advantage_disadvantage[ability] : {};
					} else {
						saving_throw.advantage_disadvantage = {};
					}

					//Check and add proficiency bonus
					if(proficient) {
						saving_throw.proficient = true;
						saving_throw.mod = saving_throw.mod + this.computed.proficiency;
					}

					saving_throws[ability] = saving_throw;
				}
				return saving_throws;
			},
			hp_modifiers() {
				return this.modifiers.filter(mod => mod.target === 'hp');
			},
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			checkAdvantage(type, subtype=undefined) {
				const sheet = this.computed.sheet;
				let returnObj;
				if(sheet && sheet.advantage_disadvantage && sheet.advantage_disadvantage[type]) {
					if(subtype) {
						returnObj = sheet.advantage_disadvantage[type][subtype];
					} else {
						returnObj = sheet.advantage_disadvantage[type];
					}
				}
				return (returnObj) ? returnObj : {};
			}
		}
	}
</script>

<style lang="scss" scoped>
	.hk-card {
		position: sticky;
		top: 0;
		margin-top: 48px;

		.card-header {
			padding: 0;
			justify-content: flex-start;
			line-height: 20px;
			font-size: 12px;

			.image {
				height: 62px;
				width: 62px;
				border-right: solid 1px $neutral-5;
				color: $neutral-2;
				background-color: $neutral-9;
				text-align: center;
				line-height: 62px;
				font-size: 45px;
				margin-right: 10px;
				background-position: center top;
				background-size: cover;
			}
		}
		
		.computed {
			padding: 15px;
	
			h4 {
				font-family: 'Fredericka the Great', cursive !important;
				font-size: 22px;
				margin: 0px;
			}
	
			.abilities {
				display: flex;
				justify-content: space-between;
				text-align: center;
				user-select: none;
				width: 100%;
				margin: 20px 0;
	
				> div {
					cursor: pointer;
	
					.ability, .score {
						font-size: 15px;
						text-transform: uppercase;
						height: 15px;
						margin: 0;
						color: $neutral-2;
					}
					.mod {
						height: 55px;
						line-height: 60px;
						font-size: 30px;
						font-weight: bold;
						font-family: 'Fredericka the Great', cursive !important;
					}
				}
			}
			.stats {
				display: flex;
				justify-content: space-between;
				user-select: none;
	
				.armor_class, .hit_points, .speed, .initiative  {
					text-align: center;
					cursor: pointer;
	
					h6 {
						font-size: 12px;
						text-transform: uppercase;
						height: 15px;
						line-height: 15px;
						margin: 0;
						color: $neutral-2;
					}
					.value {
						height: 40px;
						line-height: 40px;
						font-size: 35px;
						font-weight: bold;
						font-family: 'Fredericka the Great', cursive !important;
					}
					.ft {
						font-size: 15px;
					}
				}
			}
			.list {
				list-style: none;
				padding: 0;
				margin: 0 0 20px 0;
	
				li {
					display: flex;
					justify-content: space-between;
					line-height: 35px;
					border-bottom: solid 1px $neutral-3;
	
					.value {
						font-family: 'Fredericka the Great', cursive !important;
						font-size: 20px;
					}
				}
			}
			.columns {
				height: 128px;
				column-count: 2;
				column-gap: 15px;
				column-rule: 1px solid $neutral-3;
			}
			.advantage {
				color: #83b547 !important;
				&:hover .int {
					color: #83b547 !important;
				}
			}
			.disadvantage {
				color: #cc3e4a;
				&:hover .int {
					color: #cc3e4a !important;
				}
			}
			.neutral {
				&:hover .int {
					color: inherit !important;
				}
			}
		}
	}
</style>