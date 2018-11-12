<template>
	<div class="target">
		<span class="initiative">{{ item.initiative }}</span>
		<span class="img" :style="{'background-image': 'url(' + item.img + ')'}"></span>
		<span class="ac">{{ item.ac }}</span>
		<div class="progress health-bar">
			<div class="progress-bar bg-green" role="progressbar" style="width: 100%" 
					 aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
				{{ item.name }}
			</div>
		</div>
		<span class="hp">
			<span class="green current mr-1">{{ item.curHp }}</span>
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
	
	line-height:30px;
	margin-bottom:8px;
	border:solid 1px #262626;
	cursor:pointer;
}
.target:hover {
	border:solid 1px #2c97de;
}
.active {
	border-color:#2c97de !important;
	box-shadow: 0px 0px 10px rgba(44, 151, 222, .5);
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
}
.initiative {
	grid-area: initiative;
}
.img {
	background-color:#191919;
	background-position:center top;
	background-repeat:no-repeat;
	background-size:cover;
	color:#cc3e4a;
	font-size:20px;
	line-height:30px;
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