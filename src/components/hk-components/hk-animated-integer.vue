<template>
	<span>
		{{ tweeningValue }}
	</span>
</template>

<script>
	export default {
		name: 'hk-animated-integer',
		props: {
			value: {
				type: Number,
				required: true
			},
			onMount: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				tweeningValue: 0
			}
		},
		watch: {
			value: function (newValue, oldValue) {
				this.tween(oldValue, newValue)
			}
		},
		mounted: function () {
			if(this.onMount) {
				this.tween(0, this.value)
			} else {
				this.tweeningValue = this.value;
			}
		},
		methods: {
			tween: function (startValue, endValue) {
				const vm = this;

				function animate () {
					// eslint-disable-next-line
					if (TWEEN.update()) {
						requestAnimationFrame(animate)
					}
				}
				
				// eslint-disable-next-line
				new TWEEN.Tween({ tweeningValue: startValue })
					.to({ tweeningValue: endValue }, 500)
					.onUpdate(function () {
						vm.tweeningValue = this.tweeningValue.toFixed(0)
					})
					.start()

				animate()
			}
		}
	}
</script>