<template>
	<div>
		<div class="computed" :class="{ show: showOverview }">
			<q-circular-progress
				show-value
				class="q-ma-md"
				:value="character.hit_points"
				size="130px"
				:thickness=".1"
				color="primary"
				track-color="positive"
			>
				<q-avatar size="118px">
					<div 
						class="image"
						:style="[
							avatar ? { backgroundImage: 'url(\'' + avatar + '\')' } : 
							{ backgroundImage: `url(${require('src/assets/_img/styles/player.svg')})`}
						]"
					/>
				</q-avatar>
			</q-circular-progress>
			<div class="general">
				<h4>{{ character_name || "Unnamed Character" }}</h4>
				Level {{ character.display.level }} &bull; {{ race ? race.race_name : "" }}
				<template v-if="character.sheet && character.sheet.classes">
					<div v-for="( subclass, index) in classes" :key="`class-${index}`">
					{{ (subclass.level &lt; character.display.level) ? `${subclass.level}` : `` }}
					<b>{{ subclass.name }}</b>
					<template v-if="subclass.subclass">
						<span class="blue mx-1">&bull;</span>
						<i>{{ subclass.subclass }}</i>
					</template>
					</div>
				</template>
			</div>

			<hr>
			
			<div class="stats">
				<div class="armor_class" v-if="character.display.armor_class">
					<h6>Armor Class</h6>
					<div class="value">
						{{ character.display.armor_class }}
					</div>
				</div>
				<div 
					class="hit_points" 
					v-if="character.display.hit_points" 
					@click="setSlide({
						show: true, 
						type: 'slides/characterBuilder/HitPoints',
						data: {
							total: character.display.hit_points,
							hit_point_type,
							level: character.display.level,
							con_mod: character.sheet ? calcMod(character.sheet.abilities.constitution) : 0,
							modifiers: hp_modifiers,
							classes,
						}
					})
				">
					<h6>Hit Points</h6>
					<div class="value">
						{{ character.display.hit_points }}
					</div>
				</div>
				<div class="speed" v-if="character.display.speed">
					<h6>Speed</h6>
					<div class="value">
						{{ character.display.speed }}<span class="ft gray-hover">ft.</span>
					</div>
				</div>
				<div class="initiative" v-if="character.display.initiative">
					<h6>Initiative</h6>
					<div class="value">
						<hk-roll
							tooltip="Roll"
							:roll="{
								d: 20,
								n: 1,
								m: character.display.initiative,
								title: 'Initiative roll',
								notify: true,
								advantage: checkAdvantage('initiative')
							}"
						>
							<span class="gray-hover">
								{{ character.display.initiative >= 0 ? "+" : "-" }}</span>
								<span 
									class="int"
									:class="Object.keys(checkAdvantage('initiative')).length === 1 ? Object.keys(checkAdvantage('initiative'))[0] : ''"
								>{{ Math.abs(character.display.initiative) }}</span>
						</hk-roll>
					</div>
				</div>
			</div>

			<hr>

			<template v-if="computed.sheet && computed.sheet.abilities">
				<div class="abilities">
					<div v-for="{value, label} in abilities" :key="`score-${value}`">
						<div class="ability">{{ label.substring(0, 3) }}</div>
						<div class="mod">
							<hk-roll
								tooltip="Roll"
								:roll="{
									d: 20,
									n: 1,
									m: calcMod(computed.sheet.abilities[value]),
									title: `${value.capitalize()} check`,
									notify: true,
									advantage: checkAdvantage('abilities', value)
								}"
							>
								<span class="gray-hover" v-if="calcMod(computed.sheet.abilities[value]) !== 0">
									{{ calcMod(computed.sheet.abilities[value]) > 0 ? "+" : "-" }}</span>
								<span class="int"
									:class="Object.keys(checkAdvantage('abilities', value)).length === 1 ? Object.keys(checkAdvantage('abilities', value))[0] : ''"
								>{{ Math.abs(calcMod(computed.sheet.abilities[value])) }}</span>
							</hk-roll>
						</div>
						<div class="score">{{ computed.sheet.abilities[value] }}</div>
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
								>
									<q-tooltip anchor="top middle" self="center middle" v-if="proficient">
										Proficient
									</q-tooltip>
								</i>
								{{ key.capitalize() }}
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
			</template>

			<div v-if="character.sheet && character.sheet.senses">
				<h4>Senses</h4>
				<ul class="list">
					<li v-for="(sense, key) in character.sheet.senses" :key="key">
						<span class="type">
							<i 
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

			<!-- <pre>
				{{ character }}
			</pre> -->
		</div>
		<div class="toggle bg-gray-dark" :class="{ show: showOverview }"  @click="showOverview = !showOverview">
			<i v-if="!showOverview" class="fal fa-file-spreadsheet"></i>
			<i v-else class="fas fa-times"></i>
		</div>
	</div>
</template>

<script>
	import { mapActions } from 'vuex';
	import { general } from 'src/mixins/general.js';
	import { abilities } from 'src/mixins/abilities.js';

	export default {
		name: 'CharacterComputed',
		mixins: [general, abilities],
		props: [
			"base_values",
			"modifiers",
			"computed"
		],
		data() {
			return {
				showOverview: false
			}
		},
		computed: {
			character() {
				return (this.computed) ? this.computed : {};
			},
			race() {
				return this.base_values.race;
			},
			hit_point_type() {
				return this.base_values.general.hit_point_type;
			},
			classes() {
				return this.base_values.class.classes;
			},
			avatar() {
				return this.base_values.general.avatar;
			},
			character_name() {
				return this.base_values.general.character_name;
			},
			saving_throws() {
				let saving_throws = {};
				if(this.computed.sheet && this.computed.sheet.abilities && this.computed.sheet.saving_throws) {
					const proficiencies = this.computed.sheet.saving_throws.proficiencies || {};
					const bonuses = this.computed.sheet.saving_throws.bonuses || {};
					const advantage_disadvantage = (this.computed.sheet.advantage_disadvantage) ? this.computed.sheet.advantage_disadvantage.saving_throws : {};

					for(const ability of Object.values(this.abilities)) {
						let saving_throw = {};
						let score = this.computed.sheet.abilities[ability.value];
						const proficient = proficiencies[ability.value];
						const bonus = bonuses[ability.value] || 0;
						saving_throw.mod = this.calcMod(score) + bonus;

						//Check advantage/disadvantage
						if(advantage_disadvantage) {
							saving_throw.advantage_disadvantage = (advantage_disadvantage[ability.value]) ? advantage_disadvantage[ability.value] : {};
						} else {
							saving_throw.advantage_disadvantage = {};
						}

						//Check and add proficiency bonus
						if(proficient) {
							saving_throw.proficient = true;
							saving_throw.mod = saving_throw.mod + this.computed.display.proficiency;
						}

						saving_throws[ability.value] = saving_throw;
					}
				}
				return saving_throws;
			},
			hp_modifiers() {
				const modifiers = this.modifiers.filter(mod => {
					return mod.target === 'hp';
				});
				return modifiers;
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
	.computed {
		background-image: url('../../assets/_img/styles/paper-bg.png');
		background-position: top left;
		padding: 15px;
		position: fixed;
		top: 50px;
		right: -350px; 
		height: calc(100vh - 50px);
		z-index: 96;
		background-color: #000;
		overflow: auto;
		width: 350px;
		transition: right .5s linear,
		box-shadow .5s linear;

		h4 {
			font-family: 'Fredericka the Great', cursive !important;
			font-size: 22px;
			margin: 0px;
		}

		&.show {
			right: 0;
			box-shadow: 0 10px 15px #000;
		}

		.q-circular-progress {
			margin: 0 0 10px -5px;
		}
		.image {
			width: 118px;
			height: 118px;
			border: solid 1px #5c5757;
			border-radius: 50%;
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;
		}
		.general {
			
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
				}
				.mod {
					height: 55px;
					line-height: 60px;
					font-size: 35px;
					font-weight: bold;
					font-family: 'Fredericka the Great', cursive !important;
					color: #fff;
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
				}
				.value {
					height: 60px;
					line-height: 60px;
					font-size: 45px;
					font-weight: bold;
					font-family: 'Fredericka the Great', cursive !important;
					color: #fff;
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
				border-bottom: solid 1px #b2b2b2;

				.value {
					font-family: 'Fredericka the Great', cursive !important;
					font-size: 20px;
					color: #fff;
				}
			}
		}
		.columns {
			height: 128px;
			column-count: 2;
			column-gap: 15px;
			column-rule: 1px solid #5c5757;
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
	.toggle {
		position: fixed;
		top: 50px;
		right: 0;
		height: 48px;
		line-height: 48px;
		width: 48px;
		z-index: 97;
		text-align: center;
		transition: right .5s linear;
		display: block;
		cursor: pointer;
		color: #fff !important;
		font-size: 30px;

		i {
			transition: transform .5s linear;
		}    

		&.show {
			right: 350px;

			// i {
			// 	transform: rotate(180deg);
			// }
		}
	} 
</style>