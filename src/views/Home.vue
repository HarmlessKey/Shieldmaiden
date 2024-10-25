<template>
	<q-scroll-area
		v-if="!user"
		class="home"
		:dark="$store.getters.theme === 'dark'"
		:thumb-style="{ width: '10px' }"
		v-on:scroll="handleScroll"
	>
		<HomeHeader :scrolled="!!scrolled" />
		<template v-if="diceColors.length > 0">
			<section id="top">
				<Top :maintenance="maintenance" />
				<span
					class="die"
					:style="{
						backgroundImage:
							'url(' +
							require('src/assets/_img/logo/logo-icon-no-shield-' + diceColors[0] + '.svg') +
							')',
						transform: `rotate(${scrolled}deg)`,
					}"
				>
				</span>
			</section>
			<section id="overview" class="bg-neutral-10">
				<Feedback />
				<span
					class="die"
					:style="{
						backgroundImage:
							'url(' +
							require('src/assets/_img/logo/logo-icon-no-shield-' + diceColors[1] + '.svg') +
							')',
						transform: `rotate(${scrolled}deg)`,
					}"
				>
				</span>
			</section>
			<section id="general" class="bg-neutral-9">
				<General />
				<span
					class="die"
					:style="{
						backgroundImage:
							'url(' +
							require('src/assets/_img/logo/logo-icon-no-shield-' + diceColors[2] + '.svg') +
							')',
						transform: `rotate(${scrolled}deg)`,
					}"
				>
				</span>
			</section>
			<section id="builder" class="bg-neutral-10">
				<Builder />
				<span
					class="die"
					:style="{
						backgroundImage:
							'url(' +
							require('src/assets/_img/logo/logo-icon-no-shield-' + diceColors[3] + '.svg') +
							')',
						transform: `rotate(${scrolled}deg)`,
					}"
				>
				</span>
			</section>
			<section id="share" class="bg-neutral-9">
				<Share />
				<span
					class="die"
					:style="{
						backgroundImage:
							'url(' +
							require('src/assets/_img/logo/logo-icon-no-shield-' + diceColors[4] + '.svg') +
							')',
						transform: `rotate(${scrolled}deg)`,
					}"
				>
				</span>
			</section>
			<section id="campaign" class="bg-neutral-10">
				<Campaign />
			</section>
			<Footer />
		</template>
	</q-scroll-area>
	<div v-else class="user-content">
		<Header />
		<Authenticated>
			<UserContent />
		</Authenticated>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import HomeHeader from "src/components/home/Header.vue";
import Header from "src/components/header";
import Top from "src/components/home/Top.vue";
import Feedback from "src/components/home/Feedback.vue";
import General from "src/components/home/General.vue";
import Share from "src/components/home/Share.vue";
import Builder from "src/components/home/Builder.vue";
import Campaign from "src/components/home/Campaign.vue";
import Footer from "src/components/Footer.vue";
import UserContent from "./UserContent";
import Authenticated from "src/layouts/authenticated.vue";

export default {
	name: "home",
	props: {
		maintenance: [Boolean, String],
	},
	components: {
		HomeHeader,
		Header,
		Top,
		Feedback,
		General,
		Share,
		Builder,
		Campaign,
		Footer,
		UserContent,
		Authenticated,
	},
	data() {
		return {
			scrolled: 0,
		};
	},
	computed: {
		...mapGetters(["user"]),
		diceColors() {
			return ["cyan", "orange", "green", "blue", "red", "yellow"];
		},
	},
	methods: {
		handleScroll(e) {
			this.scrolled = e.verticalPosition;
		},
	},
};
</script>

<style lang="scss" scoped>
.home {
	height: 100vh;

	&::-webkit-scrollbar {
		display: none;
	}
	section {
		position: relative;
		padding: 50px 0;

		&#top {
			padding: $header-height 0 0 0;
		}
	}
	.die {
		width: 60px;
		height: 60px;
		background-size: 60px;
		margin-left: -30px;
		bottom: -30px;
		left: 50%;
		position: absolute;
		display: inline-block;
		background-position: center;
		background-repeat: no-repeat;
		z-index: 97;
	}
}
.hk-layout {
	height: 100vh;
	padding-top: $header-height;
}

@media only screen and (min-width: $md-breakpoint) {
	.home {
		.die {
			width: 80px;
			height: 80px;
			background-size: 80px;
			margin-left: -50px;
			bottom: -40px;
		}

		section {
			padding: 60px 0;
		}
	}
}
</style>
