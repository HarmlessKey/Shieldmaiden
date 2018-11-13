<template>
	<div class="target" >
		<span class="initiative" v-b-tooltip.hover title="Initiative">{{ item.initiative }}</span>
		<span class="img" :style="{'background-image': 'url(' + item.img + ')'}"></span>
		<span class="ac" v-b-tooltip.hover title="Armor Class">{{ item.ac }}</span>
		<div class="progress health-bar">
			<div class="progress-bar" :class="{ 
				'bg-red': percentage(item.curHp, item.maxHp) < 33, 
				'bg-orange': percentage(item.curHp, item.maxHp) > 33 && percentage(item.curHp, item.maxHp) < 76, 
				'bg-green': percentage(item.curHp, item.maxHp) > 7
				}" 
				role="progressbar" 
				:style="{width: percentage(item.curHp, item.maxHp) + '%'}" aria-valuemin="0" aria-valuemax="100">
				{{ item.name }}
			</div>
		</div>
		<span class="hp" v-b-tooltip.hover title="Current / Max HP">
			<span class="current mr-1" :class="{ 
				'red': percentage(item.curHp, item.maxHp) < 33, 
				'orange': percentage(item.curHp, item.maxHp) > 33 && percentage(item.curHp, item.maxHp) < 76, 
				'green': percentage(item.curHp, item.maxHp) > 7
				}">{{ item.curHp }}</span>
			/<span class="max ml-1">{{ item.maxHp }}</span>
		</span>
	</div>
</template>

<script>
export default {

  name: 'TargetItem',
  props: ['item'],
  data () {
    return {
			target: ''
    }
	},
	methods: {
		percentage(current, max) {
			var hp_percentage = Math.floor(current / max * 100)
			return hp_percentage
		}
	}
}
</script>

<style lang="css" scoped>
.target {
	display: grid;
	grid-template-columns: 30px 30px 30px 3fr 2fr;
	grid-template-rows: 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"initiative img ac hp-bar hp-bar hp-bar hp hp";
	
	line-height: 30px;
}

.progress { 
	height:30px;
	background-color:#4c4c4c;
	margin-right:5px;
}
.progress div { 
	color:#191919;
	white-space:nowrap;
	overflow:hidden;
	text-overflow: ellipsis;
	text-align:left;
	padding-left:10px;
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
}
</style>