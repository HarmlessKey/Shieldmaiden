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
							character.display.avatar ? { backgroundImage: 'url(\'' + character.display.avatar + '\')' } : 
							{ backgroundImage: `url(${require('@/assets/_img/styles/player.svg')})`}
						]"
					/>
				</q-avatar>
			</q-circular-progress>
			<div class="general">
				<h4>{{ character.display.character_name || "Unnamed Character" }}</h4>
				Level {{ character.display.level }} &bull; {{ character.display.race }}
				<template v-if="character.sheet && character.sheet.classes">
					<div v-for="( subclass, index) in character.sheet.classes" :key="`class-${index}`">
					{{ (subclass.level &lt; character.display.level) ? `${subclass.level}` : `` }} 
					<b>{{ subclass.class }}</b>
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
						<span class="gray-hover">
							{{ character.display.initiative >= 0 ? "+" : "-" }}</span>{{ Math.abs(character.display.initiative) }}
					</div>
				</div>
			</div>

			<hr>

			<div class="abilities" v-if="abilities">
				<div v-for="(score, ability) in abilities" :key="`score-${ability}`">
					<div class="ability">{{ ability.substring(0, 3) }}</div>
					<div class="mod">
						<span class="gray-hover" v-if="calcMod(score) !== 0">
							{{ calcMod(score) > 0 ? "+" : "-" }}</span>{{ Math.abs(calcMod(score)) }}
					</div>
					<div class="score">{{ score }}</div>
				</div>
			</div>

			<div v-if="character.sheet.senses">
				<h4>Senses</h4>
				<ul class="senses">
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

			<pre>
				{{ character }}
			</pre>
		</div>
		<div class="toggle bg-gray-dark" :class="{ show: showOverview }"  @click="showOverview = !showOverview">
			<i v-if="!showOverview" class="fal fa-file-spreadsheet"></i>
			<i v-else class="fas fa-times"></i>
		</div>
	</div>
</template>

<script>
	import { mapActions } from 'vuex';
	import { general } from '@/mixins/general.js';

	export default {
		name: 'CharacterComputed',
		mixins: [general],
		props: [
			"hit_point_type",
			"modifiers",
			"classes",
			"race",
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
			abilities() {
				return (this.computed.sheet) ? this.computed.sheet.abilities : undefined;
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
		}
	}
</script>

<style lang="scss" scoped>
	.computed {
		background-image: url('../../../../assets/_img/styles/paper-bg.png');
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
				}
				.ft {
					font-size: 15px;
				}
			}
		}
		.senses {
			list-style: none;
			padding: 0;
			margin: 0;

			li {
				display: flex;
				justify-content: space-between;
				line-height: 35px;
				border-bottom: solid 1px #b2b2b2;

				.value {
					font-family: 'Fredericka the Great', cursive !important;
					font-size: 20px;
				}
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