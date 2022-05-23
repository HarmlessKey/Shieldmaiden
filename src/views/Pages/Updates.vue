<template>
	<div>
		<div class="content">
			<h1>Updates</h1>
			<p>Check the latest updates on our Discord.</p>

			<a href="https://discord.gg/gCXJZCs" target="_blank" rel="noopener" class="btn btn-lg bg-discord-purple">
			<i aria-hidden="true" class="fab fa-discord mr-2"/>
				Harmless Key Discord
			</a>
		</div>
		<Footer />
	</div>
</template>

<script>
	import Footer from 'src/components/Footer.vue'

	export default {
		name: 'Updates',
		components: {
			Footer,
		}
	}
</script>