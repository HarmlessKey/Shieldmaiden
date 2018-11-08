<template>
	<div id="turns" class="d-flex justify-content-between bg-gray">
    <h1>Combat title</h1>
		<div class="round-info">
			<span id="round">Round <span class="number mx-2">{{ round }}</span></span>
			<span id="turn">Turn <span class="number ml-2">0</span></span>
			<span class="current-name"></span>
		</div>
		<button class="btn">Next turn <i class="fas fa-arrow-right"></i></button>
	</div>
</template>

<script>
export default {
	name: 'Turns',
	props: [
		'round'
	],
  data () {
    return {

    }
  }
}
</script>

<style lang="css" scoped>
#turns {
	padding:10px;
	height:62px;
	font-size:20px;
	text-transform:uppercase;
	grid-area: header;
	margin-bottom:10px;
}
h1 {
	line-height:44px;
}
#turns span {
	line-height:30px;
}
.number { 
	display:inline-block; 
	border:solid 1px #2c97de;
	height:42px;
	line-height:42px !important;
	margin-top:2px;
	padding:0 15px;
	font-weight:bold;
	font-size:30px;
}
</style>