<template>
	<q-scroll-area 
		class="home" 
		:dark="$store.getters.theme === 'dark'" :thumb-style="{ width: '10px'}"
		v-on:scroll="handleScroll"
	>
		<template v-if="diceColors.length > 0">
			<section id="top">
				<Top :maintenance="maintenance" />
				<span 
					class="die" 
					:style="{ 
						backgroundImage: 'url(' + require('src/assets/_img/logo/logo-icon-no-shield-' + diceColors[0] + '.svg') + ')',
						transform: `rotate(${scrolled}deg)`
					}">
				</span>
			</section>
			<section id="overview">
				<Feedback />
				<span 
					class="die" 
					:style="{ 
						backgroundImage: 'url(' + require('src/assets/_img/logo/logo-icon-no-shield-' + diceColors[1] + '.svg') + ')',
						transform: `rotate(${scrolled}deg)`
					}">
				</span>
			</section>
			<section id="general">
				<General />
				<span 
					class="die" 
					:style="{ 
						backgroundImage: 'url(' + require('src/assets/_img/logo/logo-icon-no-shield-' + diceColors[2] + '.svg') + ')',
						transform: `rotate(${scrolled}deg)`
					}">
				</span>
			</section>
			<section id="builder">
				<Builder />
				<span 
					class="die" 
					:style="{ 
						backgroundImage: 'url(' + require('src/assets/_img/logo/logo-icon-no-shield-' + diceColors[3] + '.svg') + ')',
						transform: `rotate(${scrolled}deg)`
					}">
				</span>
			</section>
			<section id="share">
				<Share />
				<span 
					class="die" 
					:style="{ 
						backgroundImage: 'url(' + require('src/assets/_img/logo/logo-icon-no-shield-' + diceColors[4] + '.svg') + ')',
						transform: `rotate(${scrolled}deg)`
					}">
				</span>
			</section>
			<section id="campaign">
				<Campaign />
			</section>
			<Footer />
		</template>
	</q-scroll-area>
</template>

<script>
	import Top from 'src/components/home/Top.vue';
	import Feedback from 'src/components/home/Feedback.vue';
	import General from 'src/components/home/General.vue';
	import Share from 'src/components/home/Share.vue';
	import Builder from 'src/components/home/Builder.vue';
	import Campaign from 'src/components/home/Campaign.vue';
	import Footer from 'src/components/Footer.vue';

	export default {
		name: 'home',
		props: {
			maintenance: [Boolean, String]
		},
		components: {
			Top,
			Feedback,
			General,
			Share,
			Builder,
			Campaign,
			Footer
		},
		data() {
			return {
				scrolled: 0
			}
		},
		computed: {
			diceColors() {
				let array = [
					'blue',
					'cyan',
					'green',
					'orange',
					'red',
					'yellow'
				];

				//Shuffle the array
				for(let i = array.length - 1; i > 0; i--){
					const j = Math.floor(Math.random() * i);
					const temp = array[i];
					array[i] = array[j];
					array[j] = temp;
				}
				return array;
			}
		},
		methods: {
			handleScroll(e) {
				this.scrolled = e.verticalPosition;
			}
		}
	}
</script>

<style lang="scss" scoped>

.home {
	height: calc(100vh - #{$header-height});

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
		z-index: 97;
	}
}
</style>