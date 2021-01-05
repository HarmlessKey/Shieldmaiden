<template>
	<div class="turns d-flex justify-content-center bg-gray-dark">
		<div class="round-info d-flex justify-content-center" v-if="encounter.round">
			<div class="mr-3">
				<div>Round</div>
				<div class="number">{{ encounter.round }}</div>
			</div>
			<div>
				<div>Turn</div>
				<div class="number">
					{{ turn + 1 }}<span class="small gray-hover">/{{ entities_len }}</span>
				</div>
			</div>
		</div>

		<icon 
			v-if="['monster', 'player', 'companion'].includes(displayImg(current, players[current.id], npcs[current.id]))" class="img d-none d-md-block"
			:icon="displayImg(current, players[current.id], npcs[current.id])" 
			:fill="current.color_label" :style="current.color_label ? `border-color: ${current.color_label}` : ``"
		/>
		<div v-else class="img d-none d-md-block" 
			:style="{ backgroundImage: 'url(\'' + displayImg(current, players[current.id], npcs[current.id]) + '\')',
			borderColor: current.color_label ? current.color_label : ``
		}"/>
		<h1 class="d-none d-md-flex justify-content-start">
			<span class="mr-3">
				<!-- Companion name is stored in NPC data -->
				<template v-if="current.entityType === 'npc' || current.entityType === 'companion'">
					<template v-if="displayNPCField('name', current)">{{ current.name }}</template>
					<template v-else>? ? ?</template>
				</template>
				<template v-else>{{ players[current.key].character_name }}</template>
			</span>

			<!-- Companion health is stored in campaign.companions -->
			<Health 
				v-if="(playerSettings.health === undefined && (current.entityType === 'player' || current.entityType === 'companion'))
				|| displayNPCField('health', current) === true"
				:entity="current"
				:campPlayers="campPlayers"
				:campCompanions="campCompanions"
				:players="players"
				:npcs="npcs"
			/>
			<template v-else-if="
				(current.entityType == 'player' && playerSettings.health === 'obscured')
				|| (current.entityType == 'npc' && displayNPCField('health', current) === 'obscured')
			">
				<template v-if="current.curHp == 0">
					<span class="gray-hover"><i class="fas fa-skull-crossbones red"></i></span>
				</template>
				<span v-else>
					
				<i  class="fas" :class="{
						'green fa-heart': percentage(current.curHp, current.maxHp) == 100,
						'orange fa-heart-broken': percentage(current.curHp, current.maxHp) < 100 && percentage(current.curHp, current.maxHp) > 33,
						'red fa-heartbeat': percentage(current.curHp, current.maxHp) <= 33,
					}"></i>
				</span>
			</template>
			<span v-else class="gray-hover">
				? ? ?
			</span>
		</h1>
		<a @click="setWeather" class="weather" v-if="encounter.weather && Object.keys(encounter.weather).length > 0">
			<i v-if="weather" class="fas fa-cloud-showers"></i>
			<i v-else class="fas fa-cloud hide"></i>
		</a>
	</div>
</template>

<script>
	import { general } from '@/mixins/general.js';
	import { trackEncounter } from '@/mixins/trackEncounter.js';
	import Health from './Health.vue';

	export default {
		name: 'app',
		mixins: [general, trackEncounter],
		components: {
			Health,
		},
		props: [
			'encounter',
			'current',
			'entities_len',
			'turn',
			'campPlayers',
			'campCompanions',
			'players',
			'playerSettings',
			'npcs',
			'npcSettings',
		],
		data() {
			return {
				userId: this.$route.params.userid,
				weather: true
			}
		},
		methods: {
			setWeather() {
				this.weather = !this.weather;
				this.$emit('setWeather', this.weather);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.turns {
		grid-area: top;
		text-transform: uppercase;
		height: 60px;
		padding: 10px;

		.round-info {
			line-height: 12px;
			font-size: 11px;
			text-align: center;

			.number { 
				font-weight: bold;
				font-size: 30px;
				line-height: 30px;
			}
		}
		.img {
			width: 40px;
			height: 40px;
			background-size: cover;
			background-position: center top;
			margin-left: 15px;
			border: solid 1px #b2b2b2;
		}
		h1 {
			line-height: 40px;
			margin-left: 20px;
		}
		.weather {
			position: absolute;
			right: 0;
			top: 0;
			height: 60px;
			width: 60px;
			line-height: 60px;
			text-align: center;
			color: #fff;
			font-size: 25px;

			.hide {
				font-size: 19px;
				vertical-align: 7px;
				opacity: .5;
			}
		}
	}
</style>
