<template>
	<q-scroll-area 
		class="home" 
		v-if="!$store.getters.user || $route.path === '/home'" 
		dark :thumb-style="{ width: '10px'}"
		v-on:scroll="handleScroll"
	>
		<template v-if="diceColors.length > 0">
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
			<section id="overview">
				<Feedback />
				<span 
					class="die" 
					:style="{ 
						backgroundImage: 'url(' + require('@/assets/_img/logo/logo-icon-no-shield-' + diceColors[1] + '.svg') + ')',
						transform: `rotate(${scrolled}deg)`
					}">
				</span>
			</section>
			<section id="general">
				<General />
				<span 
					class="die" 
					:style="{ 
						backgroundImage: 'url(' + require('@/assets/_img/logo/logo-icon-no-shield-' + diceColors[2] + '.svg') + ')',
						transform: `rotate(${scrolled}deg)`
					}">
				</span>
			</section>
			<section id="builder">
				<Builder />
				<span 
					class="die" 
					:style="{ 
						backgroundImage: 'url(' + require('@/assets/_img/logo/logo-icon-no-shield-' + diceColors[3] + '.svg') + ')',
						transform: `rotate(${scrolled}deg)`
					}">
				</span>
			</section>
			<section id="share">
				<Share />
				<span 
					class="die" 
					:style="{ 
						backgroundImage: 'url(' + require('@/assets/_img/logo/logo-icon-no-shield-' + diceColors[4] + '.svg') + ')',
						transform: `rotate(${scrolled}deg)`
					}">
				</span>
			</section>
			<section id="campaign">
				<Campaign />
			</section>
			<Footer />
			<div class="bottom-actions d-flex justify-content-center">
				<template v-if="!$store.getters.user">
					<router-link to="/sign-up" class="btn btn-lg">Create Account</router-link>
					<router-link to="/demo" class="ml-2 btn btn-lg bg-green">Demo Encounter</router-link>
				</template>
				<router-link v-else to="/content" class="ml-2 btn btn-lg bg-green">
					<i class="fas fa-treasure-chest"/>
					My content
				</router-link>
			</div>
		</template>
	</q-scroll-area>
	<SignedIn v-else />
</template>

<script>
	import Top from '@/components/home/Top.vue';
	import Overview from '@/components/home/Overview.vue';
	import Feedback from '@/components/home/Feedback.vue';
	import General from '@/components/home/General.vue';
	import Share from '@/components/home/Share.vue';
	import Builder from '@/components/home/Builder.vue';
	import Campaign from '@/components/home/Campaign.vue';
	import Footer from '@/components/Footer.vue';
	import SignedIn from '@/components/home/SignedIn.vue';

	export default {
		name: 'home',
		components: {
			Top,
			Overview,
			Feedback,
			General,
			Share,
			Builder,
			Campaign,
			Footer,
			SignedIn
		},
		data() {
			return {
				scrolled: 0
			}
		},
		metaInfo: {
			title: 'Combat Tracker D&D | Harmless Key',
			meta: [
				{ vmid: 'description', name: 'description', content: 'Initiative tracker for D&D 5e. Our tool keeps track of everything in encounters so even during combat you can give your players the attention they deserve.' }
			]
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
	padding-bottom: 85px;
	overflow-y: scroll;
	height: calc(100vh + 85px);

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
	.bottom-actions {
		background: rgba(0, 0, 0, .3);
		position: fixed;
		bottom: 0;
		width: 100%;
		padding: 20px 10px;
		height: 85px;
		line-height: 33px;
		z-index: 97;
		backdrop-filter: blur(3px);
	}
}
</style>