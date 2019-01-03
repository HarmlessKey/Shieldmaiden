<template>
	<div class="pb-5">
		<h2>
			<svg :title="condition.condition" 
				class="icon text" 
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 512 512">
					<path :d="condition.icon" fill-opacity="1"></path>
			</svg>
			 {{ condition.condition }}
		</h2>
		<ul>
			<li v-for="effect in condition.effects">
				{{ effect }}
			</li>
		</ul>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'

	export default {
		name: 'Condition',
		props: [
		'condition',
		],
		data() {
			return {
				
			}
		},

		computed: {
			
		},
		methods: {
			
		}
	};
</script>

<style lang="scss" scoped>
	ul {
		padding-left: 20px;

		li {
			margin-bottom: 10px;
		}
	}
	svg {
		width: 23px;
		height: 23px;
		color: #b2b2b2;
		fill: #b2b2b2;
	}

</style>
