<template>
	<div 
		class="hk-card"
		:class="[
			noMargin ? 'no-margin' : '',
			small ? 'small' : '',
		]"
		:style="[
			width ? { 'width': `${width}px` } : '',
			maxWidth ? { 'max-width': `${maxWidth}px` } : '',
			minWidth ? { 'min-width': `${minWidth}px` } : '',
		]"
	>
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
			},
			width: {
				type: Number,
				default: undefined
			},
			minWidth: {
				type: Number,
				default: undefined
			},
			maxWidth: {
				type: Number,
				default: undefined
			},
			noMargin: {
				type: Boolean,
				default: false
			},	
			small: {
				type: Boolean,
				default: false
			}
		}
	}
</script>