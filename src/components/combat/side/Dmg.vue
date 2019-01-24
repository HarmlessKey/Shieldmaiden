<template>
	<div class="tab-pane fade" id="damage" role="tabpanel" aria-labelledby="damage-tab">
		<ul v-for="type in types" v-if="entities">
			<h2>{{ type }} done</h2>
			<li v-for="entity in _meters[type]" class="health">
				<span class="img" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }"></span>
				<div class="progress health-bar">
					<div>
						<span class="name">
							{{ entity.name }}
						</span>
						<span class="numbers">
							{{ entity[type] }}
							({{ percentage(entity[type], type) }}%)
						</span>
					</div>
					<div class="progress-bar" 
						:class="{ 
							'bg-red': type == 'damage', 
							'bg-green': type == 'healing'
						}" 
						role="progressbar" 
						:style="{width: percentage(entity[type], type) + '%'}" aria-valuemin="0" aria-valuemax="100">
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	import _ from 'lodash'
	import { mapActions, mapGetters } from 'vuex'

	export default {
		name: 'Dmg',

		data() {
			return {
				types: [
					'damage',
					'healing',
				]
			}
		},
		computed: {
			...mapGetters([
				'entities',
			]),
			_meters: function() {
				return {
					'damage': _.chain(this.entities)
						.filter(function(entity, key) {
							entity.key = key
							return entity.damage > 0;
						})
						.orderBy(function(entity){
							return parseInt(entity.damage)
						} , 'desc')
						.value(),
					'healing': _.chain(this.entities)
						.filter(function(entity, key) {
							entity.key = key
							return entity.healing > 0;
						})
						.orderBy(function(entity){
							return parseInt(entity.healing)
						} , 'desc')
						.value()
				}
			},
		},
		methods: {
			percentage(input, type) {

				var total = 0;

				for(var key in this._meters[type]) {
					var amount = this._meters[type][key][type]
					total = total + amount;
				}
				var percentage = Math.floor(input / total * 100)
				return percentage;
			},
		},
	}
</script>

<style lang="scss" scoped>
.tab-content {
	padding: 0 10px 15px 10px;
}
ul {
	padding: 0;
	list-style: none;

	li {
		display: grid;
		grid-template-columns: 30px 1fr;
		grid-template-rows: auto;
		grid-gap: 0;
		grid-template-areas: 
		"img hp-bar";

		margin-bottom: 1px;

		.img {
			background-color: #191919;
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;
			grid-area: img;
			width: 30px; 
			height: 30px;
		}
		.progress { 
			height: 30px;
			line-height: 30px;
			background-color: #494747;
			position: relative;

			span.name, span.numbers {
				color:#191919;
				position: absolute;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;

			}
			span.numbers {
				text-align: right;
				right: 5px;
			}
			span.name {
				left: 5px;
			}
		}
	}
}
</style>
