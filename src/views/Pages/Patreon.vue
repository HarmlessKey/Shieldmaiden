<template>
	<div>
		<div class="grid">
			<div class="content">
				<h1 class="text-center">Get a Shieldmaiden subscription</h1>
				<p class="text-center">
					We use Patreon for our subscriptions. Once you make a choice, you will be redirected to
					<a
						class="patreon-red"
						href="https://www.patreon.com/shieldmaidenapp"
						target="_blank"
						rel="noopener"
						>Patreon</a
					>
					to finish payment.<br />
					Make sure that you use the <strong>same emailadres</strong> for both your Patreon and
					Shieldmaiden account.
				</p>

				<Tiers class="mb-4" />
				<hk-card header="Why do you have to pay?">
					<div class="card-body">
						<p>
							We wish we could offer the app for free. This is why we do have a free tier that
							should be sufficient for most users. All the essential features will always be
							accessible for all users, without cost. You only pay for more storage and quality of
							life features.<br />
							Unfortunately creating an app brings some costs with it. We need to invest a lot of
							time in maintaining and expanding the app. And there are the costs of hosting
							Shieldmaiden, as our user base expands, the costs increase.
						</p>

						<h2>Building together</h2>
						<p>
							Our goal is not to earn money, our goal is to create a D&D initiative tracker that is
							useful for the entire community. <br />
							To reach this goal, we will need support. This is why we have set up a Patreon. This
							way you can help us in achieving this goal and benefit from the extra's that come with
							it.
						</p>

						<a
							class="btn bg-patreon-red btn-block"
							href="https://www.patreon.com/shieldmaidenapp"
							target="_blank"
							rel="noopener"
						>
							<i aria-hidden="true" class="fab fa-patreon black"></i> Support us
						</a>
					</div>
				</hk-card>
			</div>
			<Footer />
		</div>
	</div>
</template>

<script>
import Tiers from "src/components/Tiers.vue";
import Footer from "src/components/Footer.vue";

export default {
	name: "Patreon",
	components: {
		Tiers,
		Footer,
	},
};
</script>

<style lang="scss" scoped>
.grid {
	padding-top: 30px;
	background-size: cover;
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr;
	grid-gap: 0;
	grid-template-areas:
		"container"
		"footer";

	h1 {
		margin-bottom: 40px;
	}
	h2 {
		margin-bottom: 10px !important;
	}
	p {
		font-size: 17px;
		line-height: 30px;
		margin-bottom: 40px;
	}
}
</style>
