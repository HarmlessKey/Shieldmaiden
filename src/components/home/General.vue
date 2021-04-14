<template>
	<div class="general">
		<div class="container">
			<div class="head">
				<h2>We keep track, you focus on the game</h2>
				<span>
					We focus on keeping the game on the table by managing 
					everything you need to keep track of during encounters. 
					On top of that we enhance the player experience.
				</span>
			</div>

			<div class="row q-col-gutter-xl mb-5">
				<div class="col-12 col-md-8">
					<video 
						class="video" src="@/assets/_img/home/multitargeting.mp4" 
						muted autoplay playsinline alt="Initiative tracker Harmless Key multitargeting demo" loop
					/>
				</div>
				<div class="col-12 col-md-4">					
					<q-list>
						<q-item 
							v-for="({name, icon, title}, index) in items"
							:key="`item-${index}`"
							clickable 
							@click="setDialog(name)"
						>
							<q-item-section avatar>
								<i :class="icon" />
							</q-item-section>
							<q-item-section>
								{{ title }}
							</q-item-section>
							<q-item-section avatar>
								<i class="fas fa-eye gray-hover" />
							</q-item-section>
						</q-item>
					</q-list>
				</div>
			</div>
			<div class="d-flex justify-center">
				<router-link to="/demo" class="btn btn-lg">Try Demo Encounter</router-link>
			</div>
		</div>

		<q-dialog v-model="dialog" square>
			<Carousel :slides="items" :slide="slide" />
		</q-dialog>
	</div>
</template>

<script>
	import Carousel from "./Carousel";

	export default {
		name: 'General',
		components: {
			Carousel
		},
		data() {
			return {
				dialog: false,
				slide: "hp",
				items: [
					{
						name: "hp",
						icon: "fas fa-heart",
						title: "Hit points",
						text: "Simply add or remove hit points to entities, we do the calculations for you.<br />"+
							"We also handle <i>temporary hit points</i> and <i>maximum hit point modifiers</i>."
					},
					{
						name: "roll",
						icon: "fas fa-dice-d20",
						title: "Roll abilities",
						text: "Roll monster abilities with one simply click and instantly apply the result to any target.<br/>"+
						"We figured out a way that even complex abilities, with multiple damage types for instance, can be rolled with just 1 click."
					},
					{
						name: "conditions",
						icon: "fas fa-flame",
						title: "Conditions",
						text: "Add conditions to entities so you won't forget a target was stunned ever again."
					},
					{
						name: "reminders",
						icon: "fas fa-bell",
						title: "Reminders",
						text: "Add reminders to entities that trigger notifications on certain events. "+
							"Great for <b>concentration</b>, you'll get notified when a target was concentrating "+
							"as soon as it takes damage. Or when a target needs to takes damage on the start of "+
							"their turn for instance."
					},
					{
						name: "damage-types",
						icon: "fas fa-skull",
						title: "Damage types",
						text: "We track the damage type of attacks and automatically half damage "+
							"when a target is resistant for instance. Our <b>combat log</b> shows what type of damage a target took."
					},
					{
						name: "defenses",
						icon: "fas fa-shield",
						title: "Defenses",
						text: "<b>Resistance, vulnerability and immunity.</b><br/>"+
							"You can set defenses for damage types on an entity and we automatically half, "+
							"double or ignore the value when damage of that type is taken."
					},
					{
						name: "log",
						icon: "fas fa-scroll-old",
						title: "Combat log",
						text: "We log your damage and healing actions. You'll be able to see what "+
							"happened when during an encounter and you can even undo any mistakes."
					},
					{
						name: "multitarget",
						icon: "fas fa-crosshairs",
						title: "Multi-targeting",
						text: "Perform an action for multiple targets at once. "+
						"Just select everyone within the area of a <b>fireball</b> and burn them all! "+
						"You can still half the damage if someone makes their saving throw."
					},
					{
						name: "more",
						icon: "fas fa-ellipsis-h",
						title: "And a lot more",
						text: "We can't even sum up all the things you can do with our <b>combat tracker</b>. "+
						"Go try it now and see if it offers what you need."
					},
				]
			}
		},
		methods: {
			setDialog(slide) {
				this.slide = slide;
				this.dialog = true;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.general {
		padding-bottom: 100px;
		min-height: calc(100vh - 50px - 55px);
		background-color: $gray-darker;

		ul {
			margin-bottom: 30px;
		}

		video {
			width: 100%;
		}
	}
</style>