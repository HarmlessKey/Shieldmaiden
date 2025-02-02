<template>
	<div class="pb-5">
		<h2>Set Conditions</h2>
		<ul class="targets">
			<li v-for="(target, i) in condition_targets" :key="`target=${i}`">
				<BasicEntity :entity="entities[target]">
					<Effects :entity="entities[target]" :available-space="30" conditions collapse />
				</BasicEntity>
			</li>
		</ul>
		<hr />
		<template v-if="condition_targets.length > 0">
			<q-list :dark="$store.getters.theme === 'dark'" autofocus square :class="`accordion`">
				<q-expansion-item
					v-for="({ value, name, condition, effects }, index) in conditionList"
					:key="index"
					:dark="$store.getters.theme === 'dark'"
					switch-toggle-side
					:group="name"
					@focus="focusButton($event, index)"
				>
					<template v-slot:header>
						<q-item-section>
							<div class="d-flex justify-content-start">
								<i aria-hidden="true" :class="`hki-${value}`" class="icon" />
								{{ name }}
							</div>
						</q-item-section>

						<q-item-section avatar>
							<button
								v-if="value === 'exhaustion'"
								:ref="index"
								class="btn btn-sm btn-clear"
								@click.stop
							>
								<span class="exhaustion neutral-11" v-if="checkExhaustion() != undefined">
									{{ checkExhaustion() }}
								</span>
								<i aria-hidden="true" v-else class="fas fa-plus-circle green" />

								<q-popup-proxy
									:dark="$store.getters.theme === 'dark'"
									ref="popup"
									:breakpoint="576"
								>
									<div class="bg-neutral-8">
										<q-list autofocus>
											<q-item>
												<q-item-section>Exhaustion</q-item-section>
											</q-item>
											<q-separator />
											<q-item
												clickable
												v-close-popup
												v-for="index in 6"
												:key="index"
												@click="setExhausted(index)"
												@keydown.space="setExhausted(index)"
											>
												<q-item-section>Level {{ index }}</q-item-section>
											</q-item>
											<q-separator />
											<q-item
												clickable
												v-close-popup
												@click="setExhausted(0)"
												@keydown.space="setExhausted(index)"
											>
												<q-item-section>Remove</q-item-section>
											</q-item>
										</q-list>
									</div>
								</q-popup-proxy>
							</button>
							<button
								v-else
								:ref="index"
								:key="value"
								class="btn btn-sm btn-clear"
								@click.stop="set(value)"
							>
								<span v-if="!checkAll(value)"
									><i aria-hidden="true" class="fas fa-plus-circle green" key="true"></i
								></span>
								<span v-if="checkAll(value)"
									><i aria-hidden="true" class="fas fa-minus-circle red" key="true"></i
								></span>
							</button>
						</q-item-section>
					</template>

					<div class="accordion-body">
						<b>{{ condition }}</b>
						<ul>
							<li v-for="(effect, index) in effects" :key="index">
								{{ effect }}
							</li>
						</ul>
					</div>
				</q-expansion-item>
			</q-list>
		</template>
		<p v-else class="mt-4">Select one or multiple targets to add or remove conditions.</p>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { conditions } from "src/mixins/conditions.js";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import Effects from "src/components/combat/entities/effects";

export default {
	name: "Conditions",
	mixins: [conditions],
	components: {
		BasicEntity,
		Effects,
	},
	props: ["data"],
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
		};
	},
	computed: {
		...mapGetters(["entities", "targeted", "entities"]),
		condition_targets: function () {
			if (this.data !== undefined && this.data.length > 0) return this.data;

			return this.targeted;
		},
	},
	mounted() {
		this.$refs[0]?.[0]?.focus();
	},
	methods: {
		...mapActions(["setDrawer", "set_condition"]),
		focusButton(e, i) {
			if (e.view.shiftKey) {
				i = i - 1;
			}
			const button = this.$refs[i.min(0)]?.[0];
			button?.focus();
		},
		set(condition) {
			const action = this.checkAll(condition) ? "remove" : "add";

			for (const key of this.condition_targets) {
				this.set_condition({
					action,
					key,
					condition: condition,
				});
			}
		},
		setExhausted(level) {
			var action = level === 0 ? "remove" : "add";

			for (const key of this.condition_targets) {
				this.set_condition({
					action,
					key,
					condition: "exhaustion",
					level: level,
				});
			}
			this.$refs.popup[0].hide();
		},
		check(condition, target) {
			return this.entities[target].conditions.hasOwnProperty(condition);
		},
		//Checks if all targets have a certain condition
		checkAll(condition) {
			for (const key of this.condition_targets) {
				if (!this.check(condition, key)) {
					return false;
				}
			}
			return true;
		},
		checkExhaustion() {
			let exhaustion = undefined;

			for (const key of this.condition_targets) {
				const targetsExhaustion = this.entities[key].conditions.exhaustion;

				if (targetsExhaustion && !exhaustion) {
					exhaustion = targetsExhaustion;
				} else if (targetsExhaustion !== exhaustion) {
					return false;
				}
			}
			return exhaustion;
		},
	},
};
</script>

<style lang="scss" scoped>
.q-item__section {
	line-height: 27px;

	.icon {
		color: $neutral-3;
		font-size: 23px;
		margin-right: 12px;
	}
	button {
		border-radius: 50%;
		height: 35px;
		width: 35px;
		margin: -8px;

		&:focus {
			outline: none;
			background-color: $neutral-5 !important;
		}
		.exhaustion {
			display: block;
			width: 15px;
			height: 15px;
			border-radius: 50%;
			background: $red;
			text-align: center;
			font-size: 12px;
			line-height: 15px;
			font-weight: bold !important;
		}
	}
}
ul.targets {
	list-style: none;
	padding: 0;

	li {
		margin-bottom: 2px !important;
		border: solid 1px transparent;
		width: 100%;
	}
}
</style>
