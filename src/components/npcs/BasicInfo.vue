<template>
	<div>
		<hk-card header="Basic Info">
			<!-- NAME -->
			<div class="row q-col-gutter-md mb-2">
				<div class="col-9">
					<q-input 
						dark filled square
						label="Name *"
						maxlength="101"
						autocomplete="off"  
						v-model="npc.name"
						@input="capitalizeName"
						:rules="[
							val => !!val || 'The name is required',
							val => val.length <= 100 || 'Max length is 100'
						]"
					/>
				</div>
				<div class="col-3">
					<q-input 
						dark filled square
						label="Source"
						maxlength="20"
						autocomplete="off"  
						v-model="npc.source"
						:rules="[val => !val || val.length <= 20 || 'Max length is 20']"
					/>
				</div>
			</div>

			<!-- AVATAR -->
			<div class="avatar">
				<div class="img" v-if="npc.avatar" :style="{ backgroundImage: 'url(\'' + npc.avatar + '\')' }"></div>
				<div class="img" v-else>
					<img src="@/assets/_img/styles/monster.svg" />
				</div>
				<div>
					<q-input 
						dark filled square
						label="Avatar"
						autocomplete="off"  
						type="text" 
						class="mb-2" 
						:class="{'input': true, 'error': errors.has('avatar') }" 
						v-model="npc.avatar" 
						v-validate="'url'" 
						data-vv-as="Avatar"
						name="avatar" 
						placeholder="Image URL"
						:rules="[val => !val || val.length <= 9999 || 'Max length is 9999']"
					/>
				</div>
			</div>

			<!-- SIZE -->
			<q-select
				dark filled square
				label="Size *"
				class="mb-2" 
				v-model="npc.size"
				:options="monster_sizes"
				:rules="[val => !!val || 'Pick a size']"
			/>
			
			<!-- TYPE -->
			<div class="row q-col-gutter-md">
				<div class="col-12" :class="{'col-md-6': npc.type && monster_subtypes[npc.type] }">
					<q-select
						dark filled square
						label="Type *"
						class="mb-2" 
						v-model="npc.type"
						:options="monster_types"
						:rules="[val => !!val || 'Pick a type']"
					/>
				</div>
				<div class="col-12 col-md-6" v-if="npc.type && monster_subtypes[npc.type]">
					<q-select
						dark filled square clearable
						label="Subtype"
						class="mb-2" 
						v-model="npc.subtype"
						:options="monster_subtypes[npc.type]"
					/>
				</div>
			</div>

			<!-- ALIGNMENT -->
			<q-select
				dark filled square
				label="Alignment"
				class="mb-4" 
				v-model="npc.alignment"
				:options="monster_alignment"
			/>

			<!-- SPEED -->
			<div class="row q-col-gutter-sm">
				<div class="col">
					<q-input 
						dark filled square
						label="Walk speed"
						autocomplete="off"  
						type="number" 
						class="mb-2" 
						v-model.number="npc.walk_speed" 
						@input="parseToInt(npc, 'walk_speed')"
						suffix="ft."
						:rules="[val => !val || val <= 999 || 'Max is 999']"
					>
					</q-input>
				</div>
				<div class="col">
					<q-input 
						dark filled square
						label="Swim speed"
						autocomplete="off"  
						type="number" 
						class="mb-2" 
						v-model.number="npc.swim_speed"
						@input="parseToInt(npc, 'swim_speed')"
						suffix="ft."
						:rules="[val => !val || val <= 999 || 'Max is 999']"
					>
					</q-input>
				</div>
				<div class="col">
					<q-input 
						dark filled square
						label="Fly speed"
						autocomplete="off"  
						type="number" 
						class="mb-2" 
						v-model.number="npc.fly_speed" 
						@input="parseToInt(npc, 'fly_speed')"
						suffix="ft."
						:rules="[val => !val || val <= 999 || 'Max is 999']"
					>
					</q-input>
				</div>
				<div class="col">
					<q-input 
						dark filled square
						label="Burrow speed"
						autocomplete="off"  
						type="number" 
						class="mb-2" 
						v-model.number="npc.burrow_speed"
						@input="parseToInt(npc, 'burrow_speed')"
						suffix="ft."
						:rules="[val => !val || val <= 999 || 'Max is 999']"
					>
					</q-input>
				</div>
				<div class="col">
					<q-input 
						dark filled square
						label="Climb speed"
						autocomplete="off"  
						type="number" 
						class="mb-2" 
						v-model.number="npc.climb_speed"
						@input="parseToInt(npc, 'climb_speed')"
						suffix="ft."
						:rules="[val => !val || val <= 999 || 'Max is 999']"
					>
					</q-input>
				</div>
			</div>

			<!-- LANGUAGES -->
			<q-select
				dark filled square
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
			<q-select 
				dark filled square
				label="Challenge rating *"
				v-model="npc.challenge_rating" 
				:options="challenge_ratings"
				:suffix="npc.challenge_rating ? `${monster_challenge_rating[npc.challenge_rating].xp} xp ` : ``"
				:rules="[val => !!val || 'CR is required']"
			>
				<template v-slot:option="scope">
					<q-list dark>
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

			<q-checkbox 
				size="lg" dark 
				v-model="npc.friendly" 
				class="mt-3"
				label="Add as friendly" 
				:false-value="null" 
				indeterminate-value="something-else"
			/>
		</hk-card>

		<!-- HP & AC -->
		<hk-card header="Health & Armor Class">
			<div class="row q-col-gutter-md">
				<div class="col-12 col-md-4">
					<q-input 
						dark filled square
						label="Armor class *"
						autocomplete="off"  
						type="number" 
						class="mb-2" 
						v-model.number="npc.armor_class"
						@input="parseToInt($event, npc, 'armor_class')"
						name="ac" 
						:rules="[
							val => !!val || 'AC is required',
							val => val <= 99 || 'AC can\'t be higher than 99'
						]"
					>
						<template v-slot:prepend>
							<q-icon name="fas fa-shield" size="xs" />
						</template>
					</q-input>
				</div>
				<div class="col-12 col-md-4">
					<q-input 
						dark filled square
						label="Hit points *"
						autocomplete="off"  
						type="number" 
						class="mb-2" 
						v-model.number="npc.hit_points" 
						@input="parseToInt($event, npc, 'hit_points')"
						name="hp" 
						:rules="[
							val => !!val || 'HP is required',
							val => val <= 999 || 'HP can\'t be higher than 999'
						]"
					>
						<template v-slot:prepend>
							<q-icon name="fas fa-heart" size="xs" />
						</template>
					</q-input>
				</div>
				<div class="col-12 col-md-4">
					<q-input 
						dark filled square
						label="Hit dice"
						autocomplete="off" 
						type="text" 
						class="mb-2" 
						v-model="npc.hit_dice"  
						name="hit_dice" 
						id="hitdice"
						:rules="[
							val => (!val || val.match(/^[0-9]+d[0-9]+$/)) || 'Allowed format: 2d6',
							val => !val || val.length <= 6 || 'Max length is 6'
						]"
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
			border: solid 1px #b2b2b2;
			width: 56px;
			height: 56px;
			background-size: cover;
			background-position: center top;
		}
	}
</style>