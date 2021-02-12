<template>
	<div>
		<h3 class="mt-3 white text-shadow">DM Rolls</h3>
		<ul class="rolls">
			<li v-for="(roll, index) in rolls" :key="`roll-${index}`">
				<div class="targets">
					<div class="target" v-for="(key, index) in roll.targets" :key="`target-${index}`">
						<icon 
							v-if="displayImg(entities[key], players[entities[key].id], npcs[entities[key].id]) === 'monster' || displayImg(entities[key], players[entities[key].id], npcs[entities[key].id]) === 'player'"
							class="img" 
							:icon="displayImg(entities[key], players[entities[key].id], npcs[entities[key].id])" 
							:fill="entities[key].color_label" :style="entities[key].color_label ? `border-color: ${entities[key].color_label}` : ``"
						/>
						<div v-else class="img" :style="{ 
							backgroundImage: 'url(\'' + displayImg(entities[key], players[entities[key].id], npcs[entities[key].id]) + '\')',
							borderColor: entities[key].color_label ? entities[key].color_label : ``
						}"/>

						<div class="name truncate">
							{{ entities[key].name }}
						</div>
					</div>
				</div>

				<!-- FIRST -->
				<div class="rolls" v-if="index === 0">
					<div v-if="roll.toHitTotal" class="roll bg-gray-dark">
						<div class="top">{{ roll.hitMod ? `${roll.toHit} + ${roll.hitMod}` : '' }}</div>
						<h2>{{ roll.toHitTotal }}</h2>
						<div class="bottom">to hit</div>
					</div>
					<div class="roll bg-gray-dark">
						<div class="top">{{ roll.damageMod ? `${roll.damage} + ${roll.damageMod}` : '' }}</div>
						<h2 class="red">{{ roll.damageTotal }}</h2>
						<div class="bottom">damage</div>
					</div>
				</div>
				
				<!-- NOT FIRST -->
				<div class="small-roll" v-else>
					<div v-if="roll.toHitTotal" class="roll">
						<b>{{ roll.toHitTotal }}</b> to hit
						<span v-if="roll.hitMod"> ({{ roll.toHit }} + {{ roll.hitMod }})</span>
					</div>
					<div class="roll">
						<b class="red">{{ roll.damageTotal }}</b> damage
						<span v-if="roll.damageMod"> ({{ roll.damageMod ? roll.damage + roll.damageMod : '' }})</span>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	import { trackEncounter } from '@/mixins/trackEncounter.js';

	export default {
		name: 'Rolls',
		mixins: [trackEncounter],
		props: [
			'rolls',
			'entities',
			'players',
			'npcs'
		]
	}
</script>

<style lang="scss" scoped>
	h3 {
		margin-bottom: 6px !important;
	}
	ul.rolls {
		list-style: none;
		padding: 0;
		margin: 0;

		li {
			padding: 15px 10px;
			margin-bottom: 10px;
			background: rgba(38, 38, 38, .9);
			
			.targets {
				margin-bottom: 10px;

				.target {
					background:$gray-dark;
					display: grid;
					grid-template-columns: 30px 1fr;
					font-size: 15px;
					line-height: 30px;
					margin-bottom: 5px;

					.img {
						height: 30px;
						border: solid 1px transparent;
						background-position: center top;
						background-size: cover;
					}
					.name {
						padding: 0 10px;
					}
					&:hover {
						.name {
							direction: rtl;
						}
					}
				}
			}
			&:first-child {
				.rolls {
					display: flex;
					justify-content: center;
					width: 100%;

					div.roll {
						border: solid 1px$gray-hover;
						text-align: center;
						padding: 5px 0;
						flex-direction: column;
						flex: 1 1 50%;
						margin: 5px;
						position: relative;

						h2 {
							font-size: 40px;
							margin-bottom: 0 !important;
							height: 50px;
							line-height: 50px;
							font-weight: bold;
						}
						.top, .bottom {
							font-size: 15px;
							height: 20px;
							line-height: 20px;;
						}
						.advantage {
							position: absolute;
							background:$gray-dark;
							padding: 0 10px;
							top: -5px;
							left: 50%;
						transform: translate(-50%, -50%);
						}
					}
				}
			}
			.small-roll {
				font-size: 20px;
			}
		}
	}
</style>
