<template>
	<div class="feedback">
		<div class="container">
			<div class="head">
				<h2>User feedback</h2>
				<span>
					Our favourite feedback messages
				</span>
			</div>
			<div class="d-flex justify-center">
				<q-carousel
					v-model="slide"
					swipeable
					animated
					transition-prev="slide-right"
					transition-next="slide-left"
					control-color="neutral-2"
					navigation
					padding
					arrows
					infinite
					class="transparent pb-3"
				>
					<q-carousel-slide
						v-for="({text, link, source, date}, index) in feedback"
						:name="index" 
						:key="`slide-${index}`"
					>
						<h3 v-html="source" />
						<p v-html="text" />
						<span class="neutral-3">
							{{ date }}
						</span>
						<template v-if="link">
							- <a target="_blank" :href="link" rel="noopener">View original post</a>
						</template>
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
						source: '<i aria-hidden="true" class="fab fa-discord discord-purple"></i> On Discord',
						text: "Great encounter tracker! I've tried a bunch and this is hands down the best.",
						link: "https://discordapp.com/channels/654675574488563714/654695745156284472/707949539436527639",
						date: "7 May 2020"
					},
					{
						source: '<i aria-hidden="true" class="fab fa-discord discord-purple"></i> On Discord',
						text: "I'm blown away by the quality and the attention to detail that you guys had while creating it. Honestly, "+
						"I don't think that any of the more popular options [&#8230;] ever come close to the level of quality that Shieldmaiden has!",
						link: "https://discord.com/channels/654675574488563714/654695745156284472/857324784127180810",
						date: "23 June 2021"
					},
					{
						source: '<i aria-hidden="true" class="fab fa-patreon patreon-red"></i> On Patreon',
						text: "Your tool is awesome and exactly what I was searching for. "+
							"No more paper trash or excel sheets!",
						link: "https://www.patreon.com/posts/28158979",
						date: "5 July 2019"
					},
					{
						source: '<i aria-hidden="true" class="fab fa-patreon patreon-red"></i> On Patreon',
						text: "This app seems like a GODSEND. Seeing what the app is and imagining "+
							"what it may become is (almost) as exciting at the game itself!",
						link: "https://www.patreon.com/posts/new-dms-take-40455856",
						date: "14 August 2020"
					},
					{
						source: '<i aria-hidden="true" class="fab fa-patreon patreon-red"></i> On Patreon',
						text: "Great app and great help with everything!!! "+
							"I immediately went for the highest tier because I think that "+
							"this program is amazing and I'd like to see it grow even more!!!",
						link: "https://www.patreon.com/posts/28830203",
						date: "1 August 2019"
					},
					{
						source: '<i aria-hidden="true" class="fab fa-patreon patreon-red"></i> On Patreon',
						text: "Easily one of the best supplements "+
							"I've ever seen produced for this game. Keep it up guys, I'm telling "+
							"everyone about this!",
						link: "https://www.patreon.com/posts/27234775",
						date: "30 May 2019"
					},
					{
						source: '<i aria-hidden="true" class="fab fa-discord discord-purple"></i> On Discord',
						text: "Thank you so much for your rapid updates. You guys literally "+
							"fixed the hidden NPC name feature IN THE MIDDLE of my session. "+
							"Hot damn. That is some incredibly fast patching.",
						link: "https://discordapp.com/channels/654675574488563714/654747817352495130/702699725715144845",
						date: "23 April 2020"
					},
					{
						source: '<i aria-hidden="true" class="fas fa-envelope blue"></i> In a private message',
						text: "I cannot tell you how much Shieldmaiden has helped me focus on "+
							"story and content and less on encounter logistics planning. "+
							"My players LOVE when I share the damage leaderboards after combat.",
						date: "7 January 2020"
					},
					{
						source: '<i aria-hidden="true" class="fab fa-discord discord-purple"></i> On Discord',
						text: "I can't believe this program isn't backed by more people. "+
							"It's so unbelievably well done and useful.",
						link: "https://discordapp.com/channels/654675574488563714/654747817352495130/665853124711284738",
						date: "12 January 2020"
					},
					{
						source: '<i aria-hidden="true" class="fab fa-discord discord-purple"></i> On Discord',
						text: "I use it all the time and absolutely love it. It's so cool.",
						link: "https://discord.com/channels/654675574488563714/654747817352495130/666849088406552596",
						date: "15 January 2020"
					},
					// {
					// 	source: '<i aria-hidden="true" class="fab fa-discord discord-purple"></i> On Discord',
					// 	text: "This app is great and totally worth the Patreon subscription. "+
					// 		"I've put together encounters that I was in as a player and started "+
					// 		"them with player and NPC initiatives all before my DM was able to "+
					// 		"start the first round using paper init trackers.",
					// 	link: "https://discordapp.com/channels/654675574488563714/654747817352495130/680486228784709666",
					// 	date: "21 February 2020"
					// },
				]
			}
		}
	}
</script>

<style lang="scss" scoped>
	.feedback {
		.q-carousel {
			max-width: 750px;
			height: 250px;
			font-size: 12px;

			&__slide {
				h3 {
					font-size: 17px !important;
					line-height: 20px;
					font-weight: bold;
					margin-bottom: 10px !important;
				}
				p {
					margin-bottom: 10px !important;
					line-height: 18px;
				}
			}
		}
	}
	@media only screen and (min-width: 900px) {
		.feedback{
			.q-carousel {
				width: 750px;
			}
		}
	}
</style>