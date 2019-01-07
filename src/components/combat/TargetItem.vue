<template>
	<div class="target">
		<span class="initiative" v-b-tooltip.hover title="Initiative">{{ entity.initiative }}</span>
		<span class="img" :style="{'background-image': 'url(' + entity.img + ')'}"></span>
		<span class="img" v-if="entity.img != ''" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }"></span>
		<span class="img" v-else><img src="@/assets/_img/styles/player.svg" /></span>
		<span class="ac" v-b-tooltip.hover title="Armor Class">{{ entity.ac }}</span>
		<div class="progress health-bar">
			<span>{{ entity.name }}</span>
			<div class="progress-bar" :class="{ 
				'bg-red': percentage(entity.curHp, entity.maxHp) < 33, 
				'bg-orange': percentage(entity.curHp, entity.maxHp) > 33 && percentage(entity.curHp, entity.maxHp) < 76, 
				'bg-green': percentage(entity.curHp, entity.maxHp) > 7
				}" 
				role="progressbar" 
				:style="{width: percentage(entity.curHp, entity.maxHp) + '%'}" aria-valuemin="0" aria-valuemax="100">
			</div>
		</div>
		{{ setNumber(entity.curHp) }}
		<input v-model.number="number" type="hidden">
		<span class="hp" v-b-tooltip.hover title="Current / Max HP">
			<span class="current mr-1" :class="{ 
				'red': percentage(entity.curHp, entity.maxHp) < 33, 
				'orange': percentage(entity.curHp, entity.maxHp) > 33 && percentage(entity.curHp, entity.maxHp) < 76, 
				'green': percentage(entity.curHp, entity.maxHp) > 7
				}">{{ animatedNumber }}</span>
			/<span class="max ml-1">{{ entity.maxHp }}</span>
		</span>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'TargetItem',
		props: ['item'],
		data () {
			return {
				target: '',
				number: 20,
				tweenedNumber: 0
			}
		},
		computed: {
			...mapGetters([
				'entities',
			]),
			animatedNumber: function() {
				return this.tweenedNumber.toFixed(0);
			},
			entity: function() {
				return this.entities[this.item]
			}
 		},
		watch: {
			number: function(newValue) {
				TweenLite.to(this.$data, 1, { tweenedNumber: newValue });
			}
		},
		methods: {
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			setNumber(value) {
				this.number = value
			},
		}
	}
</script>

<style lang="scss" scoped>
.target {
	width: 100%;
	display: grid;
	grid-template-columns: 30px 30px 30px 3fr 2fr;
	grid-template-rows: 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"initiative img ac hp-bar hp-bar hp-bar hp hp";
	
	line-height: 30px;
}
.progress { 
	height: 30px;
	background-color: #302f2f;
	margin-right: 5px;
	position: relative;

	span { 
		color:#191919;
		font-size: calc( 8px + (11 - 8) * ( (100vw - 360px) / ( 800 - 360) ));
		position: absolute;
		left: 5px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis !important;
	}
}
.initiative, .ac, .img {
	text-align:center;
	height: 30px;
}
.initiative {
	grid-area: initiative;
}
.img {
	background-color: #191919;
	background-position: center top;
	background-repeat: no-repeat;
	background-size: cover;
	color: #cc3e4a;
	font-size: 20px;
	line-height: 30px;
	grid-area: img;
}
.ac {
	background-color:#4c4c4c;
	font-weight:bold;
	color:#191919;
	grid-area: ac;
}
.hp {
	font-size: calc( 8px + (11 - 8) * ( (100vw - 360px) / ( 800 - 360) ));
	text-align:right;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis !important;
}
</style>