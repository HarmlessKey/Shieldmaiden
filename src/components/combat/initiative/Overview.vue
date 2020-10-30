<template>
	<div>
		<ul class="entities hasImg">
			<li v-for="(entity) in active" v-bind:key="entity.key">
				<span v-if="entity.hidden" class="img"><i class="fas fa-eye-slash red"></i></span>
				<template v-else>
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
				</template>
				<div class="d-flex justify-content-between">
					{{ entity.name }}
					<b class="blue">{{ entity.initiative }}</b>
				</div>
				<div class="actions">
					<a v-if="!entity.hidden" class="pointer" @click="set_hidden({key: entity.key, hidden: true})">
						<i class="fas fa-eye-slash"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set hidden
						</q-tooltip>
					</a>
					<a v-else class="pointer mr-1" @click="set_hidden({key: entity.key, hidden: false})">
						<i class="fas fa-eye"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Unhide
						</q-tooltip>
					</a>
					<a class="pointer mr-2" @click="set_active({key: entity.key, active: false})">
						<i class="fas fa-minus"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set inactive
						</q-tooltip>
					</a>
				</div>
			</li>
		</ul>
	
		<span class="d-flex justify-content-between pr-3">
			<h2>Inactive</h2>
		</span>

		<ul class="entities hasImg">
			<li v-for="(entity) in idle" v-bind:key="entity.key">
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
				<span class="d-flex justify-content-between">
					{{ entity.name }}
					<span>{{ entity.initiative }}</span>
				</span>
				<div class="actions">
					<a @click="set_active({key: entity.key, active: true})">
						<i class="fas fa-plus"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set active
						</q-tooltip>
					</a>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { general } from '@/mixins/general.js';

	export default {
		name: 'SetInitiativeNPC',
		mixins: [general],
		props: ['active', 'idle'],
		data () {
			return {

			}
		},
		methods: {
			...mapActions([
				'set_active',
				'set_hidden',
				'set_initiative'
			]),
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