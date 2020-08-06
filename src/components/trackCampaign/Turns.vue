<template>
	<div class="turns d-flex justify-content-center">
			<div class="round-info d-flex justify-content-center" v-if="encounter.round">
				<div class="mr-3">
					<div class="mb-1">Round</div>
					<div class="number">{{ encounter.round }}</div>
				</div>
				<div>
					<div class="mb-1">Turn</div>
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
		</div>
	
</template>

<script>
	import { db } from '@/firebase';
	import { general } from '@/mixins/general.js';
	import { trackEncounter } from '@/mixins/trackEncounter.js';
	import Health from '@/components/trackCampaign/Health.vue';

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
			}
		},
	}
</script>

<style lang="scss" scoped>
	.turns {
		padding: 10px 0 !important;

		.round-info {
			line-height: 12px;
			font-size: 11px;
			text-align: center;

			.number { 
				height: 40px;
				font-weight: bold;
				font-size: 30px;
				line-height: 30px;
			}
		}
		.img {
			width: 45px;
			height: 45px;
			background-size: cover;
			background-position: center top;
			margin-left: 15px;
			border: solid 1px #b2b2b2;
		}
		h1 {
			line-height: 45px;
			margin-left: 20px;
		}
	}
</style>
