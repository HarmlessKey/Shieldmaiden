<template>
	<div v-if="entities">
		<h2>Damage meters</h2>
		<template v-for="(type, index) in types">
			<div v-if="_meters[type.name].length > 0" :key="`meters-${index}`">
				<h3>{{ type.name.capitalize() }}</h3>
				<ul>
					<li v-for="(entity, index) in _meters[type.name]" :key="index" class="health">
						<div
							class="img"
							:style="{
								'background-image': 'url(' + entity.img + ')',
								'border-color': entity.color_label ? entity.color_label : ``,
								color: entity.color_label ? entity.color_label : ``,
							}"
						>
							<i
								aria-hidden="true"
								v-if="!entity.img"
								:class="`hki-${entity.entityType === 'npc' ? 'monster' : entity.entityType}`"
							/>
						</div>
						<q-linear-progress
							size="30px"
							:color="type.name === 'damage' ? 'negative' : 'positive'"
							:value="percentage(entity[type.name], type.name) / 100"
						>
							<div class="info">
								<span class="name">
									{{ entity.name.capitalize() }}.
									<q-tooltip anchor="center right" self="center left">
										{{ entity.name.capitalize() }}
									</q-tooltip>
								</span>
								<b class="numbers">
									<template v-if="entity[type.name] < 10000">{{ entity[type.name] }}</template>
									<template v-else>{{ entity[type.name] | numeral("0.0a") }}</template>
									<template v-if="entity[type.over]">
										(<template v-if="entity[type.over] < 10000">{{ entity[type.over] }} </template>
										<template v-else>{{ entity[type.over] | numeral("0.0a") }} </template>
										<small>over</small>)
									</template>
								</b>
							</div>
						</q-linear-progress>
					</li>
				</ul>
			</div>
		</template>
	</div>
</template>

<script>
import _ from "lodash";
import { mapGetters } from "vuex";

export default {
	name: "Dmg",

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
			var total = 0;

			for (var key in this._meters[type]) {
				var amount = this._meters[type][key][type];
				total = total + amount;
			}
			var percentage = Math.floor((input / total) * 100);
			return percentage;
		},
	},
};
</script>

<style lang="scss" scoped>
h3 {
	font-size: 15px !important;
	line-height: 25px;
	margin-bottom: 5px !important;
}
ul {
	user-select: none;
	padding: 0;
	margin: 0;
	list-style: none;

	li {
		display: grid;
		grid-template-columns: 30px 1fr;
		grid-template-rows: auto;
		grid-gap: 0;
		grid-template-areas: "img hp-bar";

		margin-bottom: 1px;

		.img {
			background-color: $neutral-9;
			color: $neutral-2;
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;
			grid-area: img;
			width: 30px;
			height: 30px;
			border: solid 1px transparent;
			font-size: 22px;

			i::before {
				vertical-align: 1px;
			}
		}
		.q-linear-progress {
			height: 30px;
			line-height: 30px;
			background-color: $neutral-7;
			position: relative;

			.info {
				font-size: 13px;
				width: 100%;
				position: absolute;
				left: 0;
				display: grid;
				grid-template-columns: auto max-content;
				grid-template-rows: auto;
				grid-gap: 0;
				grid-template-areas: "name numbers";

				span.name,
				.numbers {
					color: $neutral-1;
				}
				.numbers {
					text-align: right;
					padding: 0 5px;
				}
				span.name {
					font-weight: bold !important;
					padding-left: 5px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}
	}
}
[data-theme="light"] {
	ul li .img {
		background-color: $neutral-2;
		color: $neutral-8;
	}
}
</style>
