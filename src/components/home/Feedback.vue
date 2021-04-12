<template>
	<div class="feedback">
		<div class="container">
			<div class="head">
				<h2>User feedback</h2>
			</div>
			<div class="d-flex justify-center">
				<q-carousel
					v-model="slide"
					swipeable
					animated
					control-color="gray-light"
					navigation
					padding
					arrows
					infinite
					class="transparent pb-3"
				>
					<q-carousel-slide
						v-for="({text, link, source}, index) in feedback"
						:name="index" 
						:key="`slide-${index}`"
					>
						<h3>{{ source }}</h3>
						<p v-html="text" />
						<a v-if="link" target="_blank" :href="link">View original post</a>
					</q-carousel-slide>
				</q-carousel>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Feedback',
		data() {
			return {
				slide: 0,
				feedback: [
					{
						source: "On Discord",
						text: "Great encounter tracker! I've tried a bunch and this is hands down the best.",
						link: "https://discordapp.com/channels/654675574488563714/654695745156284472/707949539436527639"
					},
					{
						source: "On Patreon",
						text: "Your tool is awesome and exactly what I was searching for. "+
							"No more paper trash or excel sheets! ;-)",
						link: "https://www.patreon.com/posts/28158979"
					},
					{
						source: "On Patreon",
						text: "I literally started D&D a week ago and already started DMing 2 days "+
							"ago and this app seems like a GODSEND. Seeing what the app is and imagining "+
							"what it may become is (almost) as exciting at the game itself!",
						link: "https://www.patreon.com/posts/new-dms-take-40455856"
					},
					{
						source: "On Patreon",
						text: "Great app and great help with everything!!! "+
							"I immediately went for the highest tier because I think that this program is amazing and I'd like to see it grow even more!!!",
						link: "https://www.patreon.com/posts/28830203"
					},
					{
						source: "On Patreon",
						text: "Let me be the first to say that you guys are being criminally "+
							"undersupported for this product. Easily one of the best supplements "+
							"I've ever seen produced for this game. Keep it up guys, I'm telling "+
							"everyone about this!",
						link: "https://www.patreon.com/posts/27234775"
					},
					{
						source: "On Discord",
						text: "Thank you so much for your rapid updates. You guys literally "+
							"fixed the hidden NPC name feature IN THE MIDDLE of my session. "+
							"Hot damn. That is some incredibly fast patching. "+
							"I'm so proud of my Patreon subscription. And so impressed with you guys.",
						link: "https://discordapp.com/channels/654675574488563714/654747817352495130/702699725715144845"
					},
					{
						source: "In a private message",
						text: "I cannot tell you how much Harmless Key has helped me focus on "+
							"story and content and less on encounter logistics planning. "+
							"My players LOVE when I share the damage leaderboards after combat."
					},
					{
						source: "On Discord",
						text: "I can't believe this program isn't backed by more people. "+
							"It's so unbelievably well done and useful.",
						link: "https://discordapp.com/channels/654675574488563714/654747817352495130/665853124711284738"
					},
					{
						source: "On Discord",
						text: "I use it all the time and absolutely love it. It's so cool.",
						link: "https://discord.com/channels/654675574488563714/654747817352495130/666848966226346005"
					},
					{
						source: "On Discord",
						text: "This app is great and totally worth the Patreon subscription. "+
							"I've put together encounters that I was in as a player and started "+
							"them with player and NPC initiatives all before my DM was able to "+
							"start the first round using paper init trackers.",
						link: "https://discordapp.com/channels/654675574488563714/654747817352495130/680486228784709666"
					},
				]
			}
		}
	}
</script>

<style lang="scss" scoped>
	.feedback {
		padding: 100px 0;
		background-color: #111111;

		font-size: 15px;

		.head {
			padding: 0;
		}
		
		.q-carousel {
			max-width: 800px;
			width: 800px;

			&__slide {
				h3 {
					margin-bottom: 10px !important;
				}
				p {
					margin-bottom: 10px !important;
				}
			}
		}
	}
</style>