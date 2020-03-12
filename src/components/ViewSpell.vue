<template>
	<div class="spell">
		<div class="spell__title">
			<h3>{{ spell.name }}</h3>
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
						{{ _class.name }}<template v-if="Object.keys(spell.classes).length > index + 1">, </template>
					</template>
					<br/>
				</template>
		</div>

		<div class="spell__description">
			<div>{{ spell.description }}</div>
			<div v-if="spell.higher_level">
				<b class="pl-2"><i>At Higher Levels.</i></b> {{ spell.higher_level }}
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
				spell: this.data
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
		}
	};
</script>

<style lang="scss" scoped>
.spell {
	&__title {
		margin-bottom: 15px;

		h3 {
			margin-bottom: 5px;
		}
	}
	&__info {
		margin-bottom: 15px;
	}
	&__description {
		 margin-bottom: 15px;
	}
} 

</style>
