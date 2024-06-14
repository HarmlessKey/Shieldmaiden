<template>
	<div id="targets" class="bg-neutral-6-transparent" @focus="$emit('focus')">
		<h2 class="componentHeader d-flex justify-content-between" :class="{ shadow: setShadow > 0 }">
			<span>
				<i aria-hidden="true" class="fas fa-helmet-battle" /> Targets ({{ _targets.length }})
			</span>
			<button
				class="btn btn-sm bg-neutral-5"
				tabindex="-1"
				:class="{ disabled: test }"
				v-shortkey="['a']"
				@click="test ? null : setDrawer({ show: true, type: 'drawers/encounter/AddNpc' })"
				@shortkey="test ? null : setDrawer({ show: true, type: 'drawers/encounter/AddNpc' })"
			>
				<i aria-hidden="true" class="fas fa-plus green" />
				<span class="ml-1">
					Add
					<hk-show-keybind class="d-none d-sm-inline" :binds="['a']" />
				</span>
				<q-tooltip v-if="test" anchor="top middle" self="center middle"
					>Unavailable in test mode</q-tooltip
				>
			</button>
		</h2>
		<q-scroll-area
			:dark="$store.getters.theme === 'dark'"
			:thumb-style="{ width: '5px' }"
			v-on:scroll="shadow()"
			ref="scroll"
		>
			<div
				v-shortkey="{
					downSingle: ['arrowdown'],
					downMultiple: ['shift', 'arrowdown'],
					upSingle: ['arrowup'],
					upMultiple: ['shift', 'arrowup'],
				}"
				@shortkey="cycle_target"
			>
				<div>
					<TutorialPopover tutorial="run" step="target" />

					<template v-for="{ group, targets } in groups">
						<h2 :key="`header-${group}`" v-if="group !== 'active' && targets.length > 0">
							<i aria-hidden="true" v-if="group === 'down'" class="fas fa-skull-crossbones red" />
							{{ group.capitalize() }} ({{ targets.length }})
						</h2>

						<transition-group
							:key="group"
							tag="ul"
							class="targets"
							:class="`${group}_targets`"
							name="group"
							enter-active-class="animated animate__fadeInUp"
							leave-active-class="animated animate__fadeOutDown"
						>
							<li
								v-for="(entity, i) in targets"
								class="d-flex justify-content-between target-li"
								:key="entity.key"
								:class="{
									targeted: targeted.includes(entity.key),
									top: _active[0].key === entity.key && encounter.turn !== 0,
								}"
								tabindex="0"
								@keydown.space="selectTarget($event, 'single', entity.key)"
							>
								<span
									class="topinfo d-flex justify-content-between"
									v-if="group === 'active' && _active[0].key == entity.key && encounter.turn != 0"
								>
									Top of the round
									<div>
										<span class="green" v-if="Object.keys(_addedNextRound).length > 0">
											+ {{ Object.keys(_addedNextRound).length }}
											<q-tooltip anchor="top middle" self="center middle">
												Added next round
											</q-tooltip>
										</span>
										<span class="red" v-if="Object.keys(_activeDown).length > 0">
											<span class="neutral-3 mx-1">|</span>- {{ Object.keys(_activeDown).length }}
											<q-tooltip anchor="top middle" self="center middle">
												Removed next round
											</q-tooltip>
										</span>
									</div>
								</span>
								<div
									class="target"
									v-touch-hold.mouse="(event) => selectTarget(event, 'multi', entity.key)"
									@click="selectTarget($event, 'single', entity.key)"
									v-shortkey="[i]"
									@shortkey="set_targeted({ type: 'single', key: entity.key })"
								>
									<TargetItem :item="entity.key" :i="i" :initiative="true" :showReminders="true" />
								</div>
								<div v-if="!entity.active" class="d-flex">
									<a
										class="btn btn-sm btn-clear mx-1"
										v-if="entity.addNextRound"
										v-on:click.stop="
											add_next_round({ key: entity.key, action: 'tag', value: false })
										"
									>
										<i aria-hidden="true" class="fas fa-check green" />
										<q-tooltip anchor="top middle" self="center middle">
											Will be added next round
										</q-tooltip>
									</a>
									<a
										class="btn btn-sm btn-clear mx-1"
										v-if="!entity.addNextRound"
										v-on:click.stop="
											add_next_round({ key: entity.key, action: 'tag', value: true })
										"
									>
										<i aria-hidden="true" class="fas fa-check neutral-2" />
										<q-tooltip anchor="top middle" self="center middle">
											Click to add next round
										</q-tooltip>
									</a>
									<a
										class="btn btn-sm bg-neutral-5"
										@click="add_next_round({ key: entity.key, action: 'set' })"
									>
										<i aria-hidden="true" class="fas fa-arrow-up" />
										<q-tooltip anchor="top middle" self="center middle"> Add now </q-tooltip>
									</a>
								</div>
								<a class="options">
									<i aria-hidden="true" class="fal fa-ellipsis-v" />
									<q-popup-proxy
										:dark="$store.getters.theme === 'dark'"
										anchor="bottom right"
										self="top right"
										:breakpoint="576"
									>
										<target-menu :entity="entity" />
									</q-popup-proxy>
								</a>
							</li>
						</transition-group>
					</template>
				</div>
			</div>
		</q-scroll-area>
	</div>
</template>

<script>
import _ from "lodash";
import { mapGetters, mapActions } from "vuex";
import TargetItem from "src/components/combat/TargetItem.vue";
import TargetMenu from "src/components/combat/TargetMenu.vue";
import TutorialPopover from "src/components/demo/TutorialPopover.vue";

export default {
	name: "Targets",
	components: { TargetItem, TargetMenu, TutorialPopover },
	props: ["_active", "_idle"],
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			currentTarget: {},
			setShadow: 0,
		};
	},
	computed: {
		...mapGetters([
			"campaignId",
			"encounterId",
			"encounter",
			"entities",
			"targeted",
			"userSettings",
			"test",
		]),
		groups() {
			return [
				{
					group: "active",
					targets: this._targets,
				},
				{
					group: "idle",
					targets: this._idle,
				},
				{
					group: "down",
					targets: this._down,
				},
			];
		},
		_targets: function () {
			let t = this.encounter.turn;
			let turns = Object.keys(this._active);
			let order = turns.slice(t).concat(turns.slice(0, t));
			return Array.from(order, (i) => this._active[i]);
		},
		_down: function () {
			return _.chain(this.entities)
				.filter(function (entity, key) {
					entity.key = key;
					return !!entity.down;
				})
				.orderBy(function (entity) {
					return parseInt(entity.initiative);
				}, "desc")
				.value();
		},
		//Count NPC's that are down but still in active list
		_activeDown: function () {
			return _.chain(this._targets)
				.filter(function (entity) {
					return entity.curHp == 0 && entity.entityType == "npc";
				})
				.sortBy("name", "desc")
				.value();
		},
		_addedNextRound: function () {
			return _.chain(this._idle)
				.filter(function (entity) {
					return !!entity.addNextRound;
				})
				.sortBy("name", "desc")
				.value();
		},
	},
	methods: {
		...mapActions([
			"setDrawer",
			"set_hidden",
			"set_targeted",
			"set_stable",
			"remove_entity",
			"add_next_round",
		]),
		setHidden(key, hidden) {
			if (key) {
				this.set_hidden({
					key: key,
					hidden: hidden,
				});
			} else {
				this.$snotify.error("Select a target", "Hide entity", {});
			}
		},
		shadow() {
			this.setShadow = this.$refs.scroll.scrollPosition;
		},
		remove(key, name) {
			this.$snotify.error(
				'Are you sure you want to remove "' + name + '" from this encounter?',
				"Delete character",
				{
					buttons: [
						{
							text: "Yes",
							action: (toast) => {
								this.remove_entity(key);
								this.$snotify.remove(toast.id);
							},
							bold: false,
						},
						{
							text: "No",
							action: (toast) => {
								this.$snotify.remove(toast.id);
							},
							bold: true,
						},
					],
				}
			);
		},
		selectTarget(e, type, key) {
			type = e.shiftKey ? "multi" : type;
			//Select the target
			this.set_targeted({
				type,
				key,
			});
		},
		cycle_target(event) {
			const lastSelected = this.targeted[this.targeted.length - 1];
			const type =
				event.srcKey === "upSingle" || event.srcKey === "downSingle" ? "single" : "multi"; //Multitarget or not
			//Create array with keys of all targets
			const targetsArray = this._targets.map((item) => {
				return item.key;
			});
			const current = targetsArray.indexOf(lastSelected); //Set the target from where we're gonna select the next

			let index;
			//Select the next target, either up or down based on the key that's pressed
			if (event.srcKey === "downSingle" || event.srcKey === "downMultiple") {
				index = current + 1 < this._targets.length ? current + 1 : 0;
			} else {
				index = current - 1 < 0 ? targetsArray.length - 1 : current - 1;
			}
			const target = targetsArray[index];

			//Select the target
			this.set_targeted({
				type,
				key: target,
			});
		},
	},
};
</script>

<style lang="scss" scoped>
#targets {
	grid-area: targets;
	overflow: hidden;

	.target {
		width: 100%;
	}

	h2 {
		padding-left: 15px;
		margin-bottom: 5px;
		font-size: 18px;

		&.componentHeader {
			background-color: $neutral-8-transparent;
			padding: 10px 15px;
			margin-bottom: 0 !important;
			line-height: 31px;

			&.shadow {
				box-shadow: 0 0 10px rgba(0, 0, 0, 0.9);
			}
		}
	}
	a.options {
		display: inline-block;
		height: 35px;
		line-height: 35px;
		text-align: center;
		width: 25px;
		font-size: 18px;
		color: $neutral-1 !important;

		&:hover {
			color: $blue !important;
		}
	}
	.dropdown-menu {
		left: -30px !important;
		top: 0px !important;

		i {
			width: 18px;
			padding-right: 3px;
			text-align: center;
		}
	}
}
.q-scrollarea {
	padding: 0 0 30px 0;
	height: calc(100% - 55px);
}
ul.targets {
	margin: 0;
	list-style: none;
	padding: 10px 15px 10px 10px !important;

	li {
		margin-bottom: 8px;
		border: solid 1px transparent;
		cursor: pointer;
		background: $neutral-8;
		border-radius: $border-radius-small;

		&.targeted {
			outline: $blue solid 3px;
		}
		.target-item-wrapper {
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
		}

		&:focus &:not(&.targeted) {
			outline: $outline;
		}
	}
	&.active_targets li:first-child {
		margin-bottom: 20px;
		border-color: $green;
	}
	li.top {
		position: relative;
		margin-top: 35px;

		.topinfo {
			cursor: default;
			text-transform: uppercase;
			font-size: 11px;
			width: 100%;
			position: absolute;
			top: -25px;
			border-bottom: solid 1px $neutral-1;
		}
	}
}
.targets-move {
	transition: transform 0.6s;
}
.fadeInUp,
.fadeInDown {
	animation-delay: 0.6s;
}
@media only screen and (max-width: 576px) {
	#targets,
	.q-scrollarea {
		overflow: visible !important;
		padding-bottom: 0;

		.componentHeader {
			font-size: 15px;
			padding: 5px 10px;
			line-height: normal;
		}
	}
}
</style>
