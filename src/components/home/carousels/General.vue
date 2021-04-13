<template>
	<hk-card>
		<q-carousel
			v-model="slide"
			swipeable
			animated
			transition-prev="slide-right"
			transition-next="slide-left"
			control-color="gray-light"
			navigation
			padding
			arrows
			infinite
			class="transparent"
		>
			<q-carousel-slide
				v-for="({name, icon, title, text}, index) in slides"
				:name="name" 
				:key="`slide-${index}`"
				class="column no-wrap flex-center"
			>
				<i class="icon" :class="icon" />
				<h3 v-html="title" />
				<p v-html="text" />
				<router-link v-if="name === 'more'" to="sign-up" class="btn" >Create account</router-link>
			</q-carousel-slide>
		</q-carousel>

		<div class="card-footer text-center" slot="footer">
			<router-link to="/demo">Try demo encounter</router-link>
		</div>
	</hk-card>
</template>

<script>
	export default {
		name: 'General-carousel',
		data() {
			return {
				slide: "hp",
				slides: [
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
							"their turn for instance. You can create any custom reminder you need."
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
						title: "Resistance, vulnerability and immunity",
						text: "You can set defenses for damage types on an entity and we automatically half, "+
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
						icon: "fas fa-crosshairs",
						title: "And a lot more",
						text: "We can't even sum up all the things you can do with our <b>combat tracker</b>. "+
						"Go try it now and see if it offers what you need."
					},
				]
			}
		}
	}
</script>

<style lang="scss" scoped>
	.q-carousel {
		text-align: center;
		margin: -20px;

		.icon {
			font-size: 40px;
			margin-bottom: 25px;
		}
		h3 {
			font-family: 'Fredericka the Great', cursive;
			color: $white;
			font-size: 25px;
		}
	}
</style>