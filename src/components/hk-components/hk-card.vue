<template>
	<div class="hk-card">
		<slot name="image"/>
		<slot name="header" class="card-header">
			<div v-if="header" class="card-header">
				{{ header }}
			</div>
		</slot>

		<div class="card-body">
			<slot/>
		</div>

		<slot name="footer">
			<div v-if="footer" class="card-footer">
				{{ footer }}
			</div>
		</slot>
	</div>
</template>

<script>
	export default {
		name: 'hk-card',
		props: {
			header: {
				type: String,
				default: undefined
			},
			footer: {
				type: String,
				deafault: undefined
			}
		}
	}
</script>

<style lang="scss" scoped>
	.hk-card {
		position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-clip: border-box;
		background-color: #262626;
		margin-bottom: 20px;
		
		.card-header {
			padding: 0.75rem 1.25rem;
			margin-bottom: 0;
			background-color: rgba(0, 0, 0, 0.03);
			border-bottom: 1px solid rgba(0, 0, 0, 0.125);
		}
		.card-body {
			min-height: 1px;
			padding: 1.25rem;
			
			&:empty {
				display: none;
			}
		}
		.card-footer {
			padding: 0.75rem 1.25rem;
			background-color: rgba(0, 0, 0, 0.03);
			border-top: 1px solid rgba(0, 0, 0, 0.125);
		}
		.card-image {
			width: 100%;
		}
	}
</style>