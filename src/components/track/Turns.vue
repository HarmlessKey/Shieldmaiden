<template>
	<div class="turns d-flex justify-content-center">
			Round <span class="number mx-2">{{ encounter.round }}</span>
			Turn 
			<span class="number ml-2">
				{{ encounter.turn + 1 }}
				<span class="small gray-hover"> /{{ entities_len }}</span>
			</span>

				<div class="img d-none d-md-block" :style="{ backgroundImage: 'url(\'' + img(current) + '\')' }"></div>
				<h1 class="d-none d-md-flex justify-content-start">
					<span class="mr-3">
						<template v-if="current.entityType == 'npc'">{{ current.name }}</template>
						<template v-else>{{ players[current.key].character_name }}</template>
					</span>

						<Health 
							v-if="(current.entityType == 'player' && playerSettings.health === undefined)
							|| (current.entityType == 'npc' && npcSettings.health == true)"
							:entity="current
						"/>
					<span v-else class="gray-hover">
						? ? ?
					</span>
				</h1>
		</div>
	
</template>

<script>
	import { db } from '@/firebase'
	import { attributes } from '@/mixins/attributes.js'
	import Health from '@/components/track/Health.vue'

	export default {
		name: 'app',
		mixins: [attributes],
		components: {
			Health,
		},
		props: [
			'encounter',
			'current',
			'entities_len',
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
				npcSettings: {
					source: db.ref(`settings/${this.userId}/track/npc`),
					asObject: true,
				},
				playerSettings: {
					source: db.ref(`settings/${this.userId}/track/player`),
					asObject: true,
				},
			}
		},
		methods: {
			img(entity) {
				//Check what image should be displayed
				let encounterImg = entity.avatar; //img linked within the encounter

				if(encounterImg) {
					var img = encounterImg;
				} else {
					if(entity.id) {
						if(entity.entityType == 'player') {
							let playerImg = this.players[entity.id].avatar;

							if(playerImg) {
								img = playerImg
							} else {
								img = require('@/assets/_img/styles/player.svg');
							}
						}
						if(entity.entityType == 'npc') {						
							if(entity.npc == 'custom') {
								let npcImg = this.npcs[entity.id].avatar;

								img = (npcImg) ? npcImg : require('@/assets/_img/styles/monster.svg');
							} else {
								img = require('@/assets/_img/styles/monster.svg');
							}
						}
					} else {
						img = require('@/assets/_img/styles/monster.svg');
					}
				}
				return img
			},
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
		}
		h1 {
			line-height: 45px;
			margin-left: 20px;
		}
	}
</style>
