<template>
	<div class="home" v-if="diceColors.length > 0" v-on:scroll.passive="handleScroll">
		<section id="top">
			<Top />
			<span 
				class="die" 
				:style="{ 
					backgroundImage: 'url(' + require('@/assets/_img/logo/logo-icon-no-shield-' + diceColors[0] + '.svg') + ')',
					transform: `rotate(${scrolled}deg)`
				}">
			</span>
		</section>
		<section id="general">
			<General />
			<span 
				class="die" 
				:style="{ 
					backgroundImage: 'url(' + require('@/assets/_img/logo/logo-icon-no-shield-' + diceColors[1] + '.svg') + ')',
					transform: `rotate(${scrolled}deg)`
				}">
			</span>
		</section>
		<section id="share">
			<Share />
		</section>
		<Footer />
		<div class="patreon bg-black d-flex justify-content-end">
			Like what we do?
			<a href="https://www.patreon.com/join/harmlesskey" target="_blank" class="ml-2 btn bg-patreon-red"><i class="fab fa-patreon black"></i> Support us on Patreon</a>
		</div>
	</div>
</template>

<script>
	import Top from '@/components/home/Top.vue'
	import General from '@/components/home/General.vue'
	import Share from '@/components/home/Share.vue'
	import Footer from '@/components/Footer.vue'

	export default {
		name: 'home',
		components: {
			Top,
			General,
			Share,
			Footer,
		},
		data() {
			return {
				scrolled: 0,
				diceColors: []
			}
		},
		metaInfo: {
			title: 'Harmless Key | D&D Encounter Tracker',
			meta: [
				{ vmid: 'description', name: 'description', content: 'Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.' }
			]
		},
		mounted() {
			this.setColors();
		},
		methods: {
			handleScroll(e) {
				this.scrolled = e.target.scrollTop;
        	},
			dieColor(number) {
				switch(number) {
					case 1: return 'blue';
					case 2: return 'cyan';
					case 3: return 'green';
					case 4: return 'orange';
					case 5: return 'red';
					case 6: return 'yellow';
				}
			},
			setColors() {
				for(let i = 0; i < 2; i++) {
					this.returnUniqueColor();
				}
			},
			returnUniqueColor() {
				let number = Math.ceil(Math.random() * 6);
				let color = this.dieColor(number);
				
				if(this.diceColors.includes(color)) {
					this.returnUniqueColor();
				} else {
					this.diceColors.push(color);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

.home {
	padding-bottom: 55px;
	height: 100vh;
	overflow-y: scroll;

	&::-webkit-scrollbar {
		display: none;
	}
	section {
		position: relative;
	}
	.die {
		left: 50%;
  		margin-left: -50px;
		position: absolute;
		bottom: -50px;
		display: inline-block;
		width: 100px; 
		height: 100px;
		background-size: 100px;
		background-position: center;
		background-repeat: no-repeat;
		z-index: 99;
	}
	.patreon {
		position: fixed;
		bottom: 0;
		width: 100%;
		padding: 10px;
		height: 55px;
		line-height: 33px;
		z-index: 100;
	}
}


</style>