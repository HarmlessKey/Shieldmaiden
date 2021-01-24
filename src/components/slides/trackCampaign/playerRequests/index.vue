<template>
	<div>
		<div class="mb-3" v-if="characters.length > 1">
			<h5 class="mb-2">Who performs the action?</h5>
			<q-select 
				dark filled square dense
				name="doneBy"
				:value="player" 
				:options="characters"
				v-validate="'required'"
			>
				<template v-slot:selected>
					<q-item v-if="player" class="selected">
						<q-item-section avatar>
							<icon v-if="!players[player].avatar" class="img" icon="player" />
							<span 
								v-else 
								class="img" 
								:style="{'background-image': 'url(' + players[player].avatar + ')'}
							"/>
						</q-item-section>
						<q-item-section>
							<q-item-label v-html="players[player].character_name"/>
						</q-item-section>
					</q-item>
					<span v-else>
						Who performs the action?
					</span>
				</template>
				<template v-slot:option="scope">
					<q-item
						clickable
						v-ripple
						v-close-popup
						:active="player === scope.opt"
						@click="player = scope.opt"
					>
						<q-item-section avatar>
							<icon v-if="!players[scope.opt].avatar" class="img" icon="player" />
							<span 
								v-else 
								class="img" 
								:style="{'background-image': 'url(' + players[scope.opt].avatar + ')'}
							"/>
						</q-item-section>
						<q-item-section>
							<q-item-label v-html="players[scope.opt].character_name"/>
						</q-item-section>
					</q-item>
				</template>
			</q-select>
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
				npcSettings: this.data.npcSettings,
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
				border: solid 1px$white;
			}
			.name {
				padding: 6px 10px;
				line-height: 18px;
			}
		}
	}
	.q-field {
		margin-bottom: 15px;

		.q-item {
			&.selected {
				padding: 0;
				min-height: 35px !important;
				line-height: 35px !important
			}
		}
	}
	.img {
		display: block;
		width: 35px;
		height: 35px;
		background-size: cover;
		background-position: top center;
		border: solid 1px $gray-light;
	}
	
</style>
