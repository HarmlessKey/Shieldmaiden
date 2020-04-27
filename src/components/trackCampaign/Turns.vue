<template>
	<div class="turns d-flex justify-content-center">
			Round <span class="number mx-2">{{ encounter.round }}</span>
			Turn 
			<span class="number ml-2">
				{{ turn + 1 }}
				<span class="small gray-hover"> /{{ entities_len }}</span>
			</span>

				<icon 
					v-if="displayImg(current, players[current.id], npcs[current.id]) === 'monster' || displayImg(current, players[current.id], npcs[current.id]) === 'player'" class="img d-none d-md-block" 
					:icon="displayImg(current, players[current.id], npcs[current.id])" 
					:fill="current.color_label" :style="current.color_label ? `border-color: ${current.color_label}` : ``"
				/>
				<div v-else class="img d-none d-md-block" :style="{ backgroundImage: 'url(\'' + displayImg(entity, players[entity.id], npcs[entity.id]) + '\')' }"/>
				<h1 class="d-none d-md-flex justify-content-start">
					<span class="mr-3">
						<template v-if="current.entityType == 'npc'">
							<template v-if="displayNPCField('name', current)">{{ current.name }}</template>
							<template v-else>? ? ?</template>
						</template>
						<template v-else>{{ players[current.key].character_name }}</template>
					</span>

					<Health 
						v-if="(current.entityType == 'player' && playerSettings.health === undefined)
						|| displayNPCField('health', current) === true"
						:entity="current"
						:campPlayers="campPlayers"
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
		],
		data() {
			return {
				userId: this.$route.params.userid,
			}
		},
		firebase() {
			return {
				players: {
					source: db.ref(`players/${this.userId}`),
					asObject: true,
				},
				npcs: {
					source: db.ref(`npcs/${this.userId}`),
					asObject: true,
				},
				playerSettings: {
					source: db.ref(`settings/${this.userId}/track/player`),
					asObject: true,
				},
			}
		},
	}
</script>

<style lang="scss" scoped>
	.turns {
		background: rgba(38, 38, 38, .9);
		text-transform: uppercase;
		height: 65px;
		padding: 10px;
		font-size: 15px;
		line-height: 45px;

		.number { 
			display: inline-block; 
			border: solid 1px #2c97de;
			height: 45px;
			padding: 0 15px;
			font-weight: bold;
			font-size: 30px;
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
