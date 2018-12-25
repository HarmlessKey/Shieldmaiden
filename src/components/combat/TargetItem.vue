<template>
	<div class="target">
		<span class="initiative" v-b-tooltip.hover title="Initiative">{{ item.initiative }}</span>
		<span class="img" :style="{'background-image': 'url(' + item.img + ')'}"></span>
		<span class="img" v-if="item.img != ''" :style="{ backgroundImage: 'url(\'' + item.img + '\')' }"></span>
		<span class="img" v-else><img src="@/assets/_img/styles/player.svg" /></span>
		<span class="ac" v-b-tooltip.hover title="Armor Class">{{ item.ac }}</span>
		<div class="progress health-bar">
			<span>{{ item.name }}</span>
			<div class="progress-bar" :class="{ 
				'bg-red': percentage(item.curHp, item.maxHp) < 33, 
				'bg-orange': percentage(item.curHp, item.maxHp) > 33 && percentage(item.curHp, item.maxHp) < 76, 
				'bg-green': percentage(item.curHp, item.maxHp) > 7
				}" 
				role="progressbar" 
				:style="{width: percentage(item.curHp, item.maxHp) + '%'}" aria-valuemin="0" aria-valuemax="100">
			</div>
		</div>
		<span class="d-flex justify-content-end">
			<span>
				{{ setNumber(item.curHp) }}
				<input v-model.number="number" type="hidden">
				<span class="hp" v-b-tooltip.hover title="Current / Max HP">
					<span class="current mr-1" :class="{ 
						'red': percentage(item.curHp, item.maxHp) < 33, 
						'orange': percentage(item.curHp, item.maxHp) > 33 && percentage(item.curHp, item.maxHp) < 76, 
						'green': percentage(item.curHp, item.maxHp) > 7
						}">{{ animatedNumber }}</span>
					/<span class="max ml-1">{{ item.maxHp }}</span>
				</span>
			</span>
			<span>
				<a class="options" id="actions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					<i class="fas fa-ellipsis-v"></i>
				</a>
				<div class="dropdown-menu" aria-labelledby="actions">
					<a class="dropdown-item">Initiative</a>
					<a class="dropdown-item" @click="conditions(item.key)">Conditions</a>
					<a class="dropdown-item">Do damage/healing</a>
					<div class="dropdown-divider"></div>
					<a class="dropdown-item">Remove</a>
				</div>
			</span>
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
			animatedNumber: function() {
				return this.tweenedNumber.toFixed(0);
			}
		},
		watch: {
			number: function(newValue) {
				TweenLite.to(this.$data, 1, { tweenedNumber: newValue });
			}
		},
		methods: {
			...mapActions([
					'setSlide'
				]),
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			setNumber(value) {
				this.number = value
			},
			conditions(key) {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'conditions',
					key: key
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
.target {
	display: grid;
	grid-template-columns: 30px 30px 30px 3fr 2fr;
	grid-template-rows: 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"initiative img ac hp-bar hp-bar hp-bar hp hp";
	
	line-height: 30px;
}
a.options {
	padding: 0 5px;
	color: #b2b2b2 !important;

	&hover {
		color: #2c97de;
	}
}
.dropdown-menu {
	
}
.progress { 
	height: 30px;
	background-color: #4c4c4c;
	margin-right: 5px;
	position: relative;
}
.progress span { 
	color:#191919;
	position: absolute;
	left: 5px;
	white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis !important;
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
	text-align:right;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis !important;
}
</style>