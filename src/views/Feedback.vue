<template>
<div class="grid">
	<div class="content">
		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-9">
				<hk-card header="Give feedback">
					<div class="card-body">
						<p>
							If you run into an issue with our app, please let us know, whether it's a bug report or a feature request.<br/>
							Our discord is the best place to leave feedback, follow the link below.
						</p>
						<a href="https://discord.gg/fhmKBM7" target="_blank" rel="noopener" class="btn btn-lg bg-neutral-8">
							<i class="fab fa-discord discord-purple mr-2"></i> Harmless Key Discord
						</a>
					</div>
				</hk-card>
			</div>
			<div class="col-12 col-md-3">
				<ContentSideRight />
			</div>
		</div>
	</div>
	<Footer />
</div>
</template>

<script>
	import Footer from '@/components/Footer.vue';
	import Crumble from "@/components/crumble";
	import ContentSideRight from "@/components/ContentSideRight";

	export default {
		name: 'Feedback',
		components: {
			Footer,
			Crumble,
			ContentSideRight
		},
		metaInfo: {
			title: 'Feedback'
		},
	}
</script>

<style lang="scss" scoped>
.grid {
	background-size: cover;
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"container"
	"footer";

	.content {
		padding-bottom: 50px;
		line-height: 25px;
		font-size: 15px; 
		font-weight: lighter;
	}
}
</style>