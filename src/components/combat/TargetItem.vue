<template>
	<div>
		<div class="target-item bg-gray-dark" :class="{ hasInitiative: initiative }">
			<!-- INITIATIVE -->
			<span class="initiative" v-if="initiative" @click.stop>
				<i v-if="targeted.includes(entity.key)" class="fas fa-crosshairs blue" />
				<template v-else>{{ entity.initiative }}</template>
				<q-popup-proxy 
					square
					anchor="bottom middle" self="top middle"
					content-class="bg-gray px-2 py-2"
				>
					<div class="mb-1">Edit {{ entity.name }}</div>
          <q-input 
						dark filled square dense utofocus 
						label="Initiative"
						type="number" 
						color="white" 
						v-model="editable_entity.initiative" 
					/>
					<div class="d-flex justify-content-end mt-2">
						<q-btn flat class="bg-gray" v-close-popup>Cancel</q-btn>
						<q-btn
							color="primary"
							v-close-popup 
							@click.stop="set_initiative({key: entity.key, initiative: editable_entity.initiative})"
						>
							Save
						</q-btn>
					</div>
        </q-popup-proxy>
			</span>

			<!-- HIDDEN -->
			<span 
				v-if="entity.hidden" 
				class="img" 
				:style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
			>
				<i class="fas fa-eye-slash red" />
				<q-tooltip anchor="top middle" self="center middle">
					Hidden
				</q-tooltip>
			</span>

			<!-- TRANSFORMED -->
			<span 
				v-else-if="entity.transformed == true" 
				class="img" 
				:style="entity.color_label ? `border-color: ${entity.color_label}; color: ${entity.color_label}` : ``"
			>
				<i class="fas fa-paw-claws" />
				<q-tooltip anchor="top middle" self="center middle">
					Transformed
				</q-tooltip>
			</span>

			<!-- AVATAR -->
			<template v-else>
				<icon v-if="['monster', 'player', 'companion'].includes(entity.img)" class="img" :icon="entity.img" :fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``" />
				<span 
					v-else class="img" 
					:style="{
						'background-image': 'url(' + entity.img + ')',
						'border-color': entity.color_label ? entity.color_label : ``
					}"/>
			</template>

			<!-- ARMOR CLASS -->
			<div class="ac_wrapper" @click.stop>
				<i class="fas fa-shield" ></i>
				<span 
					class="ac" 
					:class="{ 
						'green': entity.ac_bonus > 0,
						'red': entity.ac_bonus < 0 
					}" 
					v-if="entity.ac_bonus"
				>
					{{ displayStats().ac + entity.ac_bonus}}
					<q-tooltip anchor="top middle" self="center middle">
						Armor class + {{ entity.ac_bonus }}
					</q-tooltip>
				</span>
				<span class="ac" v-else>
					{{ displayStats().ac }}
					<q-tooltip anchor="top middle" self="center middle">
						Armor class
					</q-tooltip>
				</span>
				<q-popup-proxy
					square
					anchor="bottom middle" self="top middle"
					content-class="bg-gray px-2 py-2"
				>
					<div class="mb-1">{{ entity.name }}</div>
          <q-input 
						dark filled square dense 
						label="Armor class bonus"
						type="number" 
						color="white" 
						v-model="editable_entity.ac_bonus" 
					>
						<q-icon slot="append" size="xs" name="fas fa-shield-check" />
						<q-btn
							slot="after"
							flat dense
							color="primary"
							icon="check"
							v-close-popup 
							@click.stop="edit_entity_prop({
								key: entity.key, 
								entityType: entity.entityType,
								prop: 'ac_bonus',
								value: editable_entity.ac_bonus
							})"
						/>
					</q-input>
          <q-input 
						class="mt-2"
						dark filled square dense 
						label="Override armor class"
						type="number" 
						color="white" 
						v-model="editable_entity.ac" 
					>
						<q-icon slot="append" size="xs" name="fas fa-shield" />
						<q-btn
							slot="after"
							flat dense
							color="primary"
							icon="check"
							v-close-popup 
							@click.stop="edit_entity_prop({
								key: entity.key, 
								entityType: entity.entityType,
								prop: 'ac',
								value: editable_entity.ac
							})"
						/>
					</q-input>
					<div class="d-flex justify-content-end mt-2">
						<q-btn flat class="bg-gray" v-close-popup>Close</q-btn>
					</div>
        </q-popup-proxy>
			</div>

			<!-- HEALT BAR -->
			<q-linear-progress 
				size="35px" 
				:value="displayStats().curHp/displayStats().maxHp"
				:color="hpBarColor(percentage(displayStats().curHp, displayStats().maxHp))" 
			>
				<div class="absolute-full health-bar">
					<div class="truncate">
						{{ entity.name }}
					</div>

					<!-- HEALTH -->
					<template v-if="entity.active">
						<span class="hp" @click.stop>
							<template v-if="entity.curHp > 0">
								<span class="current">{{ animatedNumber }}</span>
								<span class="max">
									{{ displayStats().maxHp }}
									<q-tooltip anchor="top middle" self="center middle">
										Max HP {{ entity.maxHpMod > 0 ? `+ ${entity.maxHpMod}` : `` }}
									</q-tooltip>
								</span>
								<span v-if="entity.tempHp" class="temp">
									+{{ entity.tempHp }}
									<q-tooltip anchor="top middle" self="center middle">
										Temp HP
									</q-tooltip>
								</span>
							</template>
							<template v-else>
								<div v-if="entity.stable">
									<i class="fas fa-fist-raised green"></i> Stable
								</div>
								<div v-if="entity.dead && !entity.stable">
									<i class="fas fa-skull-crossbones red"></i> Dead
								</div>
								<div v-else class="hp d-flex justify-content-end">
									<div v-for="index in 5" :key="index">
										<span v-show="entity.saves[index] == 'succes'" class="save green"><i class="fas fa-check"></i></span> 
										<span v-show="entity.saves[index] == 'fail'" class="save red"><i class="fas fa-times"></i></span>
										<span v-show="!entity.saves[index]" class="save gray-hover"><i class="fas fa-dot-circle"></i></span>
									</div>
								</div>
							</template>

							<!-- Quick edit HP -->
							<q-popup-proxy
								square
								anchor="bottom middle" self="top middle" 
								content-class="bg-gray px-2 py-2"
							>
								<div class="mb-1">{{ entity.name }}</div>
								<q-input 
									dark filled square dense 
									label="Current hit points"
									type="number" 
									color="white" 
									v-model="editable_entity.curHp" 
								>
									<q-icon slot="append" size="xs" name="fas fa-heart" />
									<q-btn
										slot="after"
										flat dense
										color="primary"
										icon="check"
										v-close-popup 
										@click.stop="edit_entity_prop({
											key: entity.key, 
											entityType: entity.entityType,
											prop: 'curHp',
											value: editable_entity.curHp
										})"
									/>
								</q-input>
								<q-input 
									dark filled square dense 
									class="my-2"
									label="Temporary hit points"
									type="number" 
									color="white" 
									v-model="editable_entity.tempHp" 
								>
									<q-icon slot="append" size="xs" name="fas fa-stopwatch" />
									<q-btn
										slot="after"
										flat dense
										color="primary"
										icon="check"
										v-close-popup 
										@click.stop="edit_entity_prop({
											key: entity.key, 
											entityType: entity.entityType,
											prop: 'tempHp',
											value: editable_entity.tempHp
										})"
									/>
								</q-input>
								<q-input 
									dark filled square dense 
									label="Maxium hit point modifier"
									type="number" 
									color="white" 
									v-model="editable_entity.maxHpMod" 
								>
									<q-icon slot="append" size="xs" name="fas fa-plus" />
									<q-btn
										slot="after"
										flat dense
										color="primary"
										icon="check"
										v-close-popup 
										@click.stop="edit_entity_prop({
											key: entity.key, 
											entityType: entity.entityType,
											prop: 'maxHpMod',
											value: editable_entity.maxHpMod
										})"
									/>
								</q-input>
								<hr/>
								<q-input 
									dark filled square dense 
									label="Override maximum hit points"
									type="number" 
									color="white" 
									v-model="editable_entity.maxHp" 
								>
									<q-btn
										slot="after"
										flat dense
										color="primary"
										icon="check"
										v-close-popup 
										@click.stop="edit_entity_prop({
											key: entity.key, 
											entityType: entity.entityType,
											prop: 'maxHp',
											value: editable_entity.maxHp
										})"
									/>
								</q-input>
								<div class="d-flex justify-content-end mt-2">
									<q-btn flat class="bg-gray" v-close-popup>Close</q-btn>
								</div>
							</q-popup-proxy>
						</span>
					</template>

					<!-- IDLE ACTIONS -->
					<div v-else class="text-right">
						<span class="green" 
							v-if="entity.addNextRound == true"
							v-on:click.stop="add_next_round({key: entity.key, action: 'tag', value: false})">
							<i class="fas fa-check"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Will be added next round
							</q-tooltip>
						</span>
						<span class="gray-hover" 
							v-if="entity.addNextRound == false"
							v-on:click.stop="add_next_round({key: entity.key, action: 'tag', value: true})">
							<i class="fas fa-check"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Click to add next round
							</q-tooltip>
						</span>
						<span class="ml-2 gray-hover" 
							@click="add_next_round({key: entity.key, action: 'set'})">
							<i class="fas fa-plus"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Add now
							</q-tooltip>
						</span>
					</div>

					<!-- CONDITIONS -->
					<div class="conditions d-flex justify-content-right" v-if="entity.conditions">
						<div class="condition bg-red" 
							v-for="(condition, key) in entity.conditions" 
							:key="key" 
							@click="showCondition(key)">
							<q-tooltip anchor="top middle" self="center middle">
								{{ key }}
							</q-tooltip>
						</div>
					</div>
				</div>
			</q-linear-progress>

		</div>

		<!-- REMINDERS -->
		<ul v-if="entity.reminders && showReminders" class="target-reminders d-flex justify-content-start">
			<li v-for="(reminder, index) in entity.reminders" :key="index" :class="'bg-'+reminder.color">
				<q-tooltip anchor="top middle" self="center middle">
					{{ reminder.title }}
				</q-tooltip>
			</li>
		</ul>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { db } from '@/firebase';

	export default {
		name: 'TargetItem',
		props: {
			item : {
				type: String,
				required: true
			}, 
			i: {
				type: Number
			},
			initiative: {
				type: Boolean,
				default: false
			},
			showReminders: {
				type: Boolean,
				default: false
			}
		},
		data () {
			return {
				user: this.$store.getters.user,
				target: '',
				tweenedNumber: 0,
				entitySetter: undefined
			}
		},
		firebase() {
			return {
				showKeybinds: {
					source: db.ref(`settings/${this.user.uid}/general`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted',
			]),
			animatedNumber() {
				return this.tweenedNumber.toFixed(0);
			},
			entity() {
				return this.entities[this.item];
			},
			editable_entity: {
				get() {
					let entity = {...this.entity};

					//remove maxHp mod
					const maxHpMod = (entity.maxHpMod) ? parseInt(entity.maxHpMod) : 0;
					entity.maxHp = (maxHpMod > 0) ? entity.maxHp - maxHpMod : entity.maxHp + Math.abs(maxHpMod);

					return (this.entitySetter) ? this.entitySetter : entity;
				},
				set(newValue) {
					this.entitySetter = newValue;
				}
			},
			number() {
				// eslint-disable-next-line
				TweenLite.to(this.$data, 1, { tweenedNumber: this.displayStats().curHp });
				return this.displayStats().curHp;
			}
		},
		watch: {
			number(newValue) {
				// eslint-disable-next-line
				TweenLite.to(this.$data, 1, { tweenedNumber: newValue });
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'add_next_round',
				'set_initiative',
				'edit_entity_prop',
				'display_maxHp'
			]),
			showCondition(key) {
				//Stop other functions so target is not deselected
				event.stopPropagation();

				this.setSlide({
					show: true, 
					type: 'slides/encounter/Condition',
					data: {
						condition: key,
						entity: this.entity
				}})
			},
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			hpBarColor(percentage) {
				if(percentage < 33) {
					return 'negative';
				} else if(percentage < 76) {
					return 'warning';
				} 
				return 'positive';
			},
			displayStats() {
				var stats = '';
				if(this.entity.transformed) {
					stats = {
						ac: this.entity.transformedAc,
						maxHp: this.entity.transformedMaxHp,
						curHp: this.entity.transformedCurHp,
					}
				}
				else {
					stats = {
						ac: this.entity.ac,
						maxHp: this.entity.maxHp,
						curHp: this.entity.curHp,
					}
				}
				return stats
			},
		}
	}
</script>

<style lang="scss" scoped>
ul.target-reminders {
	padding-left: 30px;
	list-style: none;
	margin: 0;

	li {
		width: 20px;
		height: 7px;
		margin: 1px 1px 1px 0;
	}
}
</style>