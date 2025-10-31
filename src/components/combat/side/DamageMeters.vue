<template>
	<div v-if="entities">
		<h2 class="mb-1">Damage meters</h2>
		<template v-for="(type, index) in types">
			<div v-if="_meters[type.name].length > 0" :key="`meters-${index}`">
				<h3>{{ type.name.capitalize() }}</h3>
				<ul>
					<li v-for="(entity, index) in _meters[type.name]" :key="index">
						<BasicEntity :entity="entity">
							<div class="value" :class="type.name === 'damage' ? 'red' : 'green'">
								<small v-if="entity[type.over]" class="neutral-2 whitespace-nowrap mr-1">
									(<template v-if="entity[type.over] < 10000">{{ entity[type.over] }} </template>
									<template v-else>{{ entity[type.over] | numeral("0.0a") }} </template>
									over)
								</small>
								<template v-if="entity[type.name] < 10000">{{ entity[type.name] }}</template>
								<template v-else>{{ entity[type.name] | numeral("0.0a") }}</template>
							</div>
						</BasicEntity>
						<q-linear-progress
							size="33px"
							color="neutral-9"
							class="bg-neutral-5"
							:value="percentage(entity[type.name], type.name)"
						/>
					</li>
				</ul>
			</div>
		</template>
	</div>
</template>

<script>
import _ from "lodash";
import { mapGetters } from "vuex";
import BasicEntity from "../entities/BasicEntity.vue";

export default {
	name: "DamageMeters",
	components: {
		BasicEntity,
	},
	data() {
		return {
			types: {
				damage: { name: "damage", over: "overkill" },
				healing: { name: "healing", over: "overhealing" },
			},
		};
	},
	computed: {
		...mapGetters(["entities"]),
		_meters: function () {
			return {
				damage: _.chain(this.entities)
					.filter(function (entity, key) {
						entity.key = key;
						return entity.damage > 0;
					})
					.orderBy(function (entity) {
						return parseInt(entity.damage);
					}, "desc")
					.value(),
				healing: _.chain(this.entities)
					.filter(function (entity, key) {
						entity.key = key;
						return entity.healing > 0;
					})
					.orderBy(function (entity) {
						return parseInt(entity.healing);
					}, "desc")
					.value(),
			};
		},
	},
	methods: {
		percentage(input, type) {
			return input / this._meters[type][0][type];
		},
	},
};
</script>

<style lang="scss" scoped>
h3 {
	font-size: 13px !important;
	line-height: normal;
	margin-bottom: 5px !important;
}
ul {
	user-select: none;
	padding: 0;
	margin: 0 0 15px 0;
	list-style: none;

	li {
		position: relative;
		margin-bottom: 1px;
		height: 32px;

		::v-deep {
			.basic-entity__wrapper {
				position: relative;
				z-index: 10;
				font-size: 13px;
				padding-right: 8px;
			}
		}
		.value {
			font-weight: bold;
			text-align: right;
			display: flex;
			align-items: center;
		}
		.q-linear-progress {
			background-color: $neutral-7;
			position: absolute;
			left: 35px;
			top: 0;
			width: calc(100% - 35px);
			z-index: 0;
		}
	}
}
</style>
