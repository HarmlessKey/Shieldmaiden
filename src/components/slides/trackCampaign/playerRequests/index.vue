<template>
	<div>
		<div class="mb-3" v-if="characters.length > 1">
			<h5>Who performs the action?</h5>
			<select class="form-control" v-model="player" name="player">
				<option v-for="key in characters" :key="key" :value="key">{{ players[key].character_name }}</option>
			</select>
		</div>
		
		<h5>Targets</h5>
		<ul class="targeted">
			<li v-for="(key) in targeted" :key="`target-${key}`" class="bg-gray-dark">
				<icon 
					v-if="displayImg(displayTargeted[key], players[key], npcs[displayTargeted[key].id]) === 'monster' || displayImg(displayTargeted[key], players[key], npcs[displayTargeted[key].id]) === 'player'" class="img" 
					:icon="displayImg(displayTargeted[key], players[key], npcs[displayTargeted[key].id])" 
					:fill="displayTargeted[key].color_label" :style="displayTargeted[key].color_label ? `border-color: ${displayTargeted[key].color_label}` : ``"
				/>
				<div 
					v-else
					class="img" 
					:style="{ 
						backgroundImage: 'url(\'' + displayImg(displayTargeted[key], players[key], npcs[displayTargeted[key].id]) + '\')',
						'border-color': displayTargeted[key].color_label ? displayTargeted[key].color_label : ''
					}"
				/>
				<div class="name truncate">
					<template v-if="displayTargeted[key].entityType === 'npc'">
						<template v-if="displayNPCField('name', displayTargeted[key])">
							{{ displayTargeted[key].name }}
						</template>
						<template v-else>
							? ? ?
						</template>
					</template>
					<template v-else>{{ players[key].character_name }}</template>
				</div>
			</li>
		</ul>
		<DamageHealing :targeted="targeted" :player="player" :encounter="encounter" />
	</div>
</template>

<script>
	import DamageHealing from './DamageHealing';
	import { trackEncounter } from '@/mixins/trackEncounter.js';

	export default {
		name: 'playerRequests',
		mixins: [trackEncounter],
		components: {
			DamageHealing,
		},
		props: [
		'data',
		],
		data() {
			return {
				encounter: this.data.encounter,
				characters: this.data.characters,
				targets: this.data.targets,
				targeted: this.data.targeted,
				players: this.data.players,
				campPlayers: this.data.campPlayers,
				npcs: this.data.npcs,
				player: this.data.characters[0]
			}
		},
		computed: {
			displayTargeted() {
				let targeted = {};
				for(let i in this.targets) {
					let key = this.targets[i].key;

					targeted[key] = this.targets[i];
				}
				return targeted;
			}
		}
	};
</script>

<style lang="scss" scoped>
	ul.targeted {
		padding: 0;
		list-style: none;

		li {
			margin-bottom: 2px;
			display: flex;
			justify-content: flex-start;
			height: 30px;

			.img {
				width: 30px;
				height: 30px;
				background-size: cover;
				background-position: center top;
				border: solid 1px #fff;
			}
			.name {
				padding: 6px 10px;
				line-height: 18px;
			}
		}
	}
	
</style>
