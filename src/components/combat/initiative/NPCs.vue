<template>
	<div>
		<ul class="entities hasImg">
			<li v-for="(entity, i) in npcs" :key="entity.key">
				<icon 
					v-if="['monster', 'player', 'companion'].includes(entity.img)" 
					class="img pointer" 
					:icon="entity.img" 
					:fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
				/>
				<span 
					v-else class="img pointer" 
					:style="{
						'background-image': 'url(' + entity.img + ')',
						'border-color': entity.color_label ? entity.color_label : ``
					}"
				/>
				<div class="truncate">
					<q-checkbox dark v-model="selected" :val="i" :label="entity.name" />
				</div>
				
				<div class="actions">
					<a @click="setSlide({show: true, type: 'ViewEntity', data: entity })">
						<i class="fas fa-info"></i>
						<q-tooltip anchor="top middle" self="center middle">
							SHow info
						</q-tooltip>
					</a>
					<q-input 
						dark filled square dense
						type="number" 
						class="ml-3" 
						min="0" 
						max="99" 
						v-model="entity.initiative" 
						name="npcInit" 
						@input="set_initiative({key: entity.key, initiative: entity.initiative})"
						placeholder="0"
					>
						<template v-slot:append>
							<a @click="rollMonster(entity.key, entity)">
							<q-icon size="small" name="fas fa-dice-d20"/>
							<q-tooltip anchor="top middle" self="center middle">
								1d20 + {{ calcMod(entity.dexterity) }}
							</q-tooltip>
						</a>
						</template>
					</q-input>
				</div>

			</li>
		</ul>
		<div class="pl-2 pr-3">
			<a class="btn btn-block" @click="(selected.length === 0) ? rollAll() : rollGroup()">
				<i class="fas fa-dice-d20"></i> Roll {{ selected.length === 0 ? "all" : "selected"}}
			</a>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapGetters, mapActions } from 'vuex';
	import { dice } from '@/mixins/dice.js';
	import { general } from '@/mixins/general.js';

	export default {
		name: 'SetInitiativeNPC',
		mixins: [general, dice],
		props: ['npcs'],
		data () {
			return {
				selected: [],
				selectAll: []
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_initiative'
			]),
			rollMonster(key, entity) {
				let roll = this.rollD(20, 1, this.calcMod(entity.dexterity));
				entity.initiative = roll.total
				this.set_initiative({
					key: key,
					initiative: entity.initiative
				})
			},
			rollAll() {
				for (let i in this.npcs) {
					let key = this.npcs[i].key
					this.rollMonster(key, this.npcs[i])
				}
			},
			rollGroup() {
				let dex = Infinity
				let i
				let key
				let entity
				for(i in this.selected) {
					key = this.selected[i]
					entity = this.npcs[key]

					//Find lowest Dex
					if(entity.dexterity < dex) {
						dex = entity.dexterity;
					}
				}
				let roll = this.rollD(20,1,this.calcMod(dex)).total;

				for(let i in this.selected) {
					key = this.selected[i]
					entity = this.npcs[key]
					entity.initiative = roll

					this.set_initiative({
						key: entity.key,
						initiative: entity.initiative
					})
				}
				this.selected = []
			},
		}
	}
</script>

<style lang="scss" scoped>
#container {
	padding:10px;
	width: 100vw;
	height: calc(100% - 50px);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 60px auto;
	grid-gap: 10px;
	grid-template-areas: 
	"turns turns turns"
	"players npcs set";
	position: absolute;

	.q-scrollarea{
		padding:0 0 15px 0;
		height: calc(100% - 45px);
	}
	
	h2 {
		padding-left: 10px;

		&.componentHeader {
			padding: 10px 15px !important;
			margin-bottom: 0 !important;

			&.shadow {
				box-shadow: 0 0 10px rgba(0,0,0,0.9); 
			}
		}
	}
	.players, .npcs, .set {
		background: rgba(38, 38, 38, .9);
		overflow: hidden;
	}
	.players {
		grid-area: players;
	}
	.npcs {
		grid-area: npcs;
	}
	.set {
		grid-area: set;
	}
	ul.entities {
		padding:0 15px 0 10px;

		li {
			border: solid 1px transparent;
			background: #191919;

			&:hover {
				background: #141414 !important;
			}

			&.selected {
				border-color: #2c97de;
			}
			.img {
				font-size: 20px;
				line-height: 44px;
				text-align: center;
			}
		}
	}
}
.initiative-move {
  transition: transform .5s;
}
@media only screen and (max-width: 600px) {
	#container {
		grid-template-columns: auto;
		grid-template-rows: 60px 1fr 1fr 1fr;
		grid-gap: 10px;
		grid-template-areas:
		"turns"
		"players"
		"npcs"
		"set";
	}
	.players, .npcs, .set, .q-scrollarea {
		overflow: visible !important;
	}
}
</style>