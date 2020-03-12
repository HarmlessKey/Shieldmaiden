<template>
	<div class="spell">
		<div class="spell__title">
			<h3>{{ spell.name }} <span class="source gray-hover">{{ spell.source }}</span></h3>
			<i>{{ spell.level | numeral('0o') }}-level {{ spell.school }}</i>
		</div>

		<div class="spell__info">
			<b>Casting time:</b> {{ spell.cast_time_nr }} {{spell.cast_time_type }}<br/>
			<b>Range:</b> {{ range }}<br/>
			<b>Components:</b>
			<template v-for="(component, index) in spell.components">
					{{ component }}<template v-if="Object.keys(spell.components).length > index + 1">, </template>
				</template>
				<template v-if="spell.material"> ({{ spell.material }})</template>
				<br/>
				<b>Duration:</b> {{ duration }}<br/>
				<template v-if="spell.classes">
					<b>Classes:</b> 
					<template v-for="(_class, index) in spell.classes">
						{{ _class }}<template v-if="Object.keys(spell.classes).length > index + 1">, </template>
					</template>
				</template>
		</div>

		<div class="spell__description">
			<div>{{ spell.description }}</div>
			<div v-if="spell.higher_level">
				<b class="pl-2"><i>At Higher Levels.</i></b> {{ spell.higher_level }}
			</div>
		</div>

		<div class="actions">
			<h4>Roll spell</h4>

			<p>Select level</p>
			<div class="actions__levels">
				<div 
					class="level"
					:class="{ 
						selected: selectedLevel === i,
						disabled: i < spell.level
					}"
					v-for="i in 9"
					:key="i"
					@click="(spell.level <= i) ? selectLevel(i) : null"
				>
					{{ i }}
				</div>
			</div>
		</div>

		<pre>
			{{ spell }}
		</pre>
	</div>
</template>

<script>
	import { db } from '@/firebase'

	export default {
		name: 'Spell',
		props: [
		'data'
		],
		data() {
			return {
				spell: this.data,
				selectedLevel: this.data.level
			}
		},
		computed: {
			duration() {
				const type = this.spell.duration_type;
				const n = this.spell.duration_n;
				const scale = this.spell.duration_scale;

				if(type === 'Concentration') {
					let dur_scale = (n === 1) ? scale : scale+'s';
					return `Concentration, up to ${n} ${dur_scale}`;
				}
				if(type === 'Time') {
					let dur_scale = (n === 1) ? scale : scale+'s';
					return `${n} ${dur_scale}`;
				}
				return type;
			},
			range() {
				const type = this.spell.range_type;
				const range = this.spell.range;

				if(type === 'Ranged') {
					return `${range} feet`;
				}

				return type;
			}
		},
		methods: {
			selectLevel(i) {
				this.selectedLevel = i;
			}
		}
	};
</script>

<style lang="scss" scoped>
.spell {
	&__title {
		margin-bottom: 15px;

		h3 {
			margin-bottom: 5px;

			.source {
				font-size: 12px;
			}
		}
	}
	&__info {
		margin-bottom: 15px;
	}
	&__description {
		 margin-bottom: 15px;
	}

	.actions {
		margin-bottom: 15px;

		&__levels {
			display: flex;
			justify-content: flex-start;
			margin: 0 -5px;

			.level {
				width: 30px;
				height: 30px;
				line-height: 30px;
				text-align: center;
				cursor: pointer;
				background-color: #191919;
				user-select: none;
				margin: 0 3px;

				&.selected {
					background-color: #2c97de;
					color: #fff; 
				}
				&.disabled {
					opacity: .4;
					cursor: not-allowed;
				}
			}
		}
	}
} 

</style>
