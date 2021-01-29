<template>
	<div>
		<ul v-if="entities" class="entities hasImg">
			<li v-for="entity in players" :key="entity.key">
				<icon v-if="['monster', 'player', 'companion'].includes(entity.img)" class="img" :icon="entity.img" :fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``" />
				<span 
					v-else class="img" 
					:style="{
						'background-image': 'url(' + entity.img + ')',
						'border-color': entity.color_label ? entity.color_label : ``
					}"/>
				<div class="truncate">
					{{ entity.name }}
				</div>
				<div class="actions">
					<div>
						{{ entity.curHp}} / {{entity.maxHp}}
						<span v-if="entity.tempHp"> + {{ entity.tempHp }}</span>
					</div>
					<a @click="setSlide({show: true, type: 'slides/encounter/EditEntity', data: [entity.key] })">
						<i class="fas fa-pencil"></i>
					</a>
					<q-input 
						dark filled square dense
						type="number" 
						class="ml-2"
						v-model="entity.initiative" 
						min="0" 
						max="99" 
						name="playerInit" 
						placeholder="0"
						@focus="$event.target.select()"
						@input="set_initiative({key: entity.key, initiative: entity.initiative})" 
					/>
				</div>
			</li>
		</ul>
		<div v-else class="loader"><span>Loading Players...</span></div>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'SetInitiativePlayer',
		props: ['players'],
		computed: {
			...mapGetters([
				'campaignId',
				'encounterId',
				'entities',
				'path',
			]),
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_initiative'
			])
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
			background:$gray-dark;

			&:hover {
				background: #141414 !important;
			}

			&.selected {
				border-color: $blue;
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