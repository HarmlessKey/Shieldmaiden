<template>
	<div class="hk-card" @click="emit">
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
		},
		methods: {
			emit() {
				this.$emit('click');
			}
		}
	}
</script>