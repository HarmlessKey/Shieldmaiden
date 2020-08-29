<template>
	<div class="computed">
		<div 
				class="image"
				:style="[
					character.display.avatar ? { backgroundImage: 'url(\'' + character.display.avatar + '\')' } : 
					{ backgroundImage: `url(${require('@/assets/_img/styles/player.svg')})`}
				]"
		/>
		<div class="general">
			<h4>{{ character.display.character_name || "Unnamed Character" }}</h4>
			<div v-if="character.sheet && character.sheet.classes">
				{{ character.display.race }} {{ character.sheet.classes[0].class }}
			</div>
			Level {{ character.display.level }} 
		</div>
		
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

		<div class="stats">
			<div class="armor_class" v-if="character.display.armor_class">
				<h6>Armor Class</h6>
				<div class="value">
					{{ character.display.armor_class }}
				</div>
			</div>
			<div class="hit_points" v-if="character.display.hit_points">
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
	</div>
</template>

<script>
	import { general } from '@/mixins/general.js';

	export default {
		name: 'CharacterComputed',
		mixins: [general],
		props: [
			"computed"
		],
		computed: {
			character() {
				return (this.computed) ? this.computed : {};
			},
			abilities() {
				return (this.computed.sheet) ? this.computed.sheet.abilities : undefined;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.computed {
		width: 100%;
		padding: 15px;
		display: grid;
		grid-template-columns: 68px max-content max-content 1fr;
		grid-column-gap: 15px;
		margin-bottom: 15px;
		background-color: rgba(0, 0, 0, .5);
		border: solid 1px #5c5757;

		.image {
			width: 68px;
			height: 68px;
			border: solid 1px #5c5757;
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;
		}
		.general {
			h4 {
				font-size: 18px;
				margin-bottom: 3px;
			}
		}
		.abilities {
			display: flex;
			justify-content: flex-start;
			text-align: center;
			user-select: none;

			> div {
				margin-right: 20px;
				cursor: pointer;

				.ability, .score {
					font-size: 12px;
					text-transform: uppercase;
					height: 12px;
					margin: 0;
				}
				.mod {
					height: 44px;
					line-height: 50px;
					font-size: 35px;
					font-weight: bold;
					font-family: 'Fredericka the Great', cursive !important;
				}
			}
		}
		.stats {
			display: flex;
			justify-content: flex-end;
			margin-right: 15px;

			.armor_class, .hit_points, .speed, .initiative  {
				margin-left: 15px;
				text-align: center;

				h6 {
					font-size: 12px;
					text-transform: uppercase;
					height: 12px;
					margin: 0;
				}
				.value {
					height: 56px;
					line-height: 56px;
					font-size: 45px;
					font-weight: bold;
					font-family: 'Fredericka the Great', cursive !important;
				}
				.ft {
					font-size: 15px;
				}
			}
		}
	}
</style>