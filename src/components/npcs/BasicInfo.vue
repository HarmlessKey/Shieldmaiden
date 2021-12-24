<template>
	<div>
		<hk-card header="Basic Info">
			<div class="card-body">

				<!-- NAME -->
				<div class="row q-col-gutter-md mb-2">
					<div class="col-9">
						<ValidationProvider rules="max:100|required" name="Name" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Name *"
								maxlength="100"
								autocomplete="off"  
								v-model="npc.name"
								@input="capitalizeName"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<div class="col-3">
						<ValidationProvider rules="max:20" name="Source" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Source"
								maxlength="20"
								autocomplete="off"  
								v-model="npc.source"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
				</div>

				<!-- AVATAR -->
				<div class="avatar mb-2">
					<div class="img" :style="{ backgroundImage: 'url(\'' + npc.avatar + '\')' }">
						<i v-if="!npc.avatar" class="hki-monster" />
					</div>
					<div>
						<ValidationProvider rules="url|max:2000" name="Avatar" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Avatar"
								autocomplete="off"  
								type="text" 
								v-model="npc.avatar" 
								placeholder="Image URL"
								maxLength="2000"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
				</div>

				<!-- SIZE -->
				<ValidationProvider rules="required" name="Type" v-slot="{ errors, invalid, validated }">
					<q-select
						:dark="$store.getters.theme === 'dark'" filled square
						label="Size *"
						class="mb-2" 
						v-model="npc.size"
						:options="monster_sizes"
						:error="invalid && validated"
						:error-message="errors[0]"
					/>
				</ValidationProvider>
				
				<!-- TYPE -->
				<div class="row q-col-gutter-md">
					<div class="col-12" :class="{'col-md-6': npc.type && monster_subtypes[npc.type] }">
						<ValidationProvider rules="required" name="Type" v-slot="{ errors, invalid, validated }">
							<q-select
								:dark="$store.getters.theme === 'dark'" filled square
								label="Type *"
								class="mb-2" 
								v-model="npc.type"
								:options="monster_types"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<div class="col-12 col-md-6" v-if="npc.type && monster_subtypes[npc.type]">
						<q-select
							:dark="$store.getters.theme === 'dark'" filled square clearable
							label="Subtype"
							class="mb-2" 
							v-model="npc.subtype"
							:options="monster_subtypes[npc.type]"
						/>
					</div>
				</div>

				<!-- ALIGNMENT -->
				<q-select
					:dark="$store.getters.theme === 'dark'" filled square
					label="Alignment"
					class="mb-4" 
					v-model="npc.alignment"
					:options="monster_alignment"
				/>

				<!-- SPEED -->
				<div class="row q-col-gutter-sm">
					<div class="col">
						<ValidationProvider rules="between:0,999" name="Walk speed" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Walk speed"
								autocomplete="off"  
								type="number" 
								class="mb-2" 
								v-model.number="npc.walk_speed" 
								@input="parseToInt($event, npc, 'walk_speed')"
								suffix="ft."
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<div class="col">
						<ValidationProvider rules="between:0,999" name="Swim speed" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Swim speed"
								autocomplete="off"  
								type="number" 
								class="mb-2" 
								v-model.number="npc.swim_speed"
								@input="parseToInt($event, npc, 'swim_speed')"
								suffix="ft."
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<div class="col">
						<ValidationProvider rules="between:0,999" name="Fly speed" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Fly speed"
								autocomplete="off"  
								type="number" 
								class="mb-2" 
								v-model.number="npc.fly_speed" 
								@input="parseToInt($event, npc, 'fly_speed')"
								suffix="ft."
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<div class="col">
						<ValidationProvider rules="between:0,999" name="Burrow speed" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Burrow speed"
								autocomplete="off"  
								type="number" 
								class="mb-2" 
								v-model.number="npc.burrow_speed"
								@input="parseToInt($event, npc, 'burrow_speed')"
								suffix="ft."
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<div class="col">
						<ValidationProvider rules="between:0,999" name="Climb speed" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Climb speed"
								autocomplete="off"  
								type="number" 
								class="mb-2" 
								v-model.number="npc.climb_speed"
								@input="parseToInt($event, npc, 'climb_speed')"
								suffix="ft."
								:error="invalid && validated"
								:error-message="errors[0]"
							>
							</q-input>
						</ValidationProvider>
					</div>
				</div>

				<!-- LANGUAGES -->
				<q-select
					:dark="$store.getters.theme === 'dark'" filled square
					bottom-slots
					label="Languages"
					class="mb-2" 
					multiple
					v-model="npc.languages"
					:options="languages"
					use-input
					new-value-mode="add-unique"
				/>

				<!-- CR -->
				<ValidationProvider rules="required" name="CR" v-slot="{ errors, invalid, validated }">
					<q-select 
						:dark="$store.getters.theme === 'dark'" filled square
						label="Challenge rating *"
						v-model="npc.challenge_rating" 
						:options="challenge_ratings"
						:suffix="npc.challenge_rating ? `${monster_challenge_rating[npc.challenge_rating].xp} xp ` : ``"
						:error="invalid && validated"
						:error-message="errors[0]"
					>
						<template v-slot:option="scope">
							<q-list :dark="$store.getters.theme === 'dark'">
								<q-item clickable v-ripple v-close-popup @click="$set(npc, 'challenge_rating', scope.opt)">
									<q-item-section>{{ 
										(scope.opt == 0.125) ? "&#8539;" : 
										(scope.opt == 0.25) ? "&#xbc;" :
										(scope.opt == 0.5) ? "&#xBD;" :
										scope.opt
									}}</q-item-section>
									<q-item-section avatar>{{ monster_challenge_rating[scope.opt].xp }} xp</q-item-section>
								</q-item>
							</q-list>
						</template>
						<div slot="after" v-if="npc.challenge_rating" class="pr-3">
							+{{ monster_challenge_rating[npc.challenge_rating].proficiency }}
							<q-tooltip anchor="top middle" self="center middle">
								Proficiency bonus
							</q-tooltip>
						</div>
					</q-select>
				</ValidationProvider>

				<q-checkbox 
					size="lg" :dark="$store.getters.theme === 'dark'" 
					v-model="npc.friendly" 
					class="mt-3"
					label="Add as friendly" 
					:false-value="null" 
					indeterminate-value="something-else"
				/>
			</div>
		</hk-card>

		<!-- HP & AC -->
		<hk-card header="Health & Armor Class">
			<div class="card-body">
				<div class="row q-col-gutter-md">
					<div class="col-12 col-md-4">
						<ValidationProvider rules="required|between:1,99" name="AC" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Armor class *"
								autocomplete="off"  
								type="number" 
								class="mb-2" 
								v-model.number="npc.armor_class"
								@input="parseToInt($event, npc, 'armor_class')"
								name="ac" 
								:error="invalid && validated"
								:error-message="errors[0]"
							>
								<template v-slot:prepend>
									<q-icon name="fas fa-shield" size="xs" />
								</template>
							</q-input>
						</ValidationProvider>
					</div>
					<div class="col-12 col-md-4">
						<ValidationProvider rules="required|between:1,999" name="HP" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Hit points *"
								autocomplete="off"  
								type="number" 
								class="mb-2" 
								v-model.number="npc.hit_points" 
								@input="parseToInt($event, npc, 'hit_points')"
								name="hp" 
								:error="invalid && validated"
								:error-message="errors[0]"
							>
								<template v-slot:prepend>
									<q-icon name="fas fa-heart" size="xs" />
								</template>
							</q-input>
						</ValidationProvider>
					</div>
					<div class="col-12 col-md-4">
						<ValidationProvider rules="hit_dice|max:10" name="Hit dice" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Hit dice"
								autocomplete="off" 
								type="text" 
								class="mb-2" 
								v-model="npc.hit_dice"  
								name="hit_dice" 
								id="hitdice"
								:error="invalid && validated"
								:error-message="errors[0]"
							>
								<template v-slot:append>
									<small>{{ npc.hit_dice ? `(${hitDiceStr(npc)})` : '' }}</small>
									<hk-popover header="Hit Dice + Modifier">
										<q-icon name="info" size="xs" class="blue" />
										<template #content>
											The modifier is the NPC's Constitution modifier multiplied by the number of hit dice.
										</template>
									</hk-popover>
								</template>
							</q-input>
						</ValidationProvider>
					</div>
				</div>
			</div>
		</hk-card>
	</div>
</template>

<script>
	import { general } from '@/mixins/general.js';
	import { languages } from '@/mixins/languages.js';
	import { monsterMixin } from '@/mixins/monster.js';

	export default {
		name: 'npc-BasicInfo',
		props: ['value'],
		mixins: [
			general, 
			monsterMixin,
			languages,
		],
		computed: {
			npc: {
				get() {
					return this.value;
				},	
				set(newValue) {
					this.$emit('input', newValue);
				}
			},
			challenge_ratings() {
				let crs = [];
				for(const cr in this.monster_challenge_rating) {
					crs.push(Number(cr));
				}
				return crs.sort(function(a, b){return a-b});
			}
		},
		methods: {
			parseToInt(value, object, property) {
				if(value === undefined || value === "") {
					this.$delete(object, property);
				} else {
					this.$set(object, property, parseInt(value));
				}
			},
			// Capitalizes every word in the name of the Npc
			capitalizeName(val) {
				this.npc.name = val.capitalizeEach();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.avatar {
		display: grid;
		grid-template-columns: 56px 1fr;
		grid-column-gap: 10px;

		.img {
			border: solid 1px $neutral-3;
			width: 56px;
			height: 56px;
			background-size: cover;
			background-position: center top;
			color: $neutral-2;
			background-color: $neutral-9;
			font-size: 45px;

			i::before {
				vertical-align: 5px;
			}
		}
	}
	[data-theme="light"] {
		.avatar .img {
			background-color: $neutral-2;
			color: $neutral-8;
		}
	}
</style>