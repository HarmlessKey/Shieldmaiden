<template>
	<div 
		class="avatar"			 
		:style="{ 
		backgroundImage: 'url(\'' + displayImg(entity) + '\')',
		'border-color': entity.color_label ? entity.color_label : '',
		'color': entity.color_label ? entity.color_label : ''
		}"
	>
		<i aria-hidden="true" v-if="['monster', 'player', 'companion'].includes(displayImg(entity))" :class="`hki-${displayImg(entity)}`" />
	</div>
</template>

<script>
	export default {
		name: 'Avatar',
		props: {
			entity: {
				type: Object,
				required: true
			},
			players: {
				type: Object,
				required: true
			},
			npcs: {
				type: Object,
				required: true
			},
			npcSettings: {
				type: Object
			}
		},
		methods: {
			displayImg(entity) {
			//Check what image should be displayed
			let encounterImg = (entity) ? entity.avatar : undefined; //img linked within the encounter
			let img;

			if(encounterImg) {
				img = encounterImg;
			} else {
				if(!entity.entityType) {
					let playerImg = (this.players && this.players[entity.key]) ? this.players[entity.key].storage_avatar || this.players[entity.key].avatar : entity.avatar;
					img = playerImg || 'player';
				}
				else if(entity.id) {
					if(entity.entityType == 'player') {
						const player = this.players[entity.key];
						let playerImg = (player) ? player.storage_avatar || player.avatar : undefined;
						img = playerImg || 'player';
					}
					if(entity.entityType == 'companion') {
						const npc = this.npcs[entity.key];
						let companionImg = (npc) ? npc.storage_avatar || npc.avatar : undefined;
						img = companionImg || 'companion';
					}
					if(entity.entityType == 'npc') {		
						const npc = this.npcs[entity.id];				
						if(entity.npc == 'custom') {
							let npcImg = (npc) ? npc.storage_avatar || npc.avatar : undefined;
							img = npcImg || 'monster';
						} else {
							img = 'monster';
						}
					}
				} else {
					img = 'monster';
				}
			}
			return img;
		}
	}
	}
</script>

<style lang="scss" scoped>
	.avatar {
		background-color: $neutral-9;
		background-position: center top;
		background-repeat: no-repeat;
		background-size: cover;
		width: 100%; 
		height: 100%;
		border: solid 1px transparent;
		color: $neutral-2;
		font-size: 42px;
		overflow: hidden;
		text-align: center;
	}

	[data-theme="light"] {
		.avatar {
			background-color: $neutral-1;
			color: $neutral-7;
		}
	}
</style>