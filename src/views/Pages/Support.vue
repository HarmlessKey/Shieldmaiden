<template>
	<hk-card>
		<div slot="header" class="card-header">
			Get support
			<a class="btn btn-sm bg-discord-purple" href="https://discord.gg/ZHDGj6GqJH" target="_blank" rel="noopener">
				<i class="fab fa-discord mr-1" aria-hidden="true" /> Join Discord
			</a>
		</div>
		<q-no-ssr class="card-body">
			<p>
				For any support needed, you can contact us on our Discord. 
				We recommend joining our <a href="https://discord.gg/ZHDGj6GqJH" rel="noopener" target="_blank">Discord server</a>, 
				but for quick help you can directly leave a message below.
			</p>
			<iframe 
				class="widget-bot"
				title="WidgetBot"
				src="https://e.widgetbot.io/channels/654675574488563714/654680291801038880"
			/>
		</q-no-ssr>
	</hk-card>
</template>

<script>
	export default {
		name: 'Support'
	}
</script>

<style lang="scss" scoped>
	.widget-bot {
		width: 100%;
		height: 600px;
		border: 1px solid $neutral-7;
		border-radius: $border-radius;
		background-color: $neutral-8;
	}
</style>