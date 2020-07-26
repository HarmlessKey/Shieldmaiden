<template>
	<div class="computed bg-gray">
		<div 
				class="image"
				:style="[
					character.avatar ? { backgroundImage: 'url(\'' + character.avatar + '\')' } : 
					{ backgroundImage: `url(${require('@/assets/_img/styles/player.svg')})`}
				]"
		/>
		<div class="general">
			<h4>{{ character.character_name || "Unnamed Character" }}</h4>
			<div v-if="character.classes">
				{{ character.race }} {{ character.classes.main.class }}
			</div>
			Level {{ character.level }} 
		</div>
		<div class="stats">
			<div class="armor_class" v-if="character.armor_class">
				<h6>Armor Class</h6>
				<div class="value">
					{{ character.armor_class }}
				</div>
			</div>
			<div class="hit_points" v-if="character.hit_points">
				<h6>Hit Points</h6>
				<div class="value">
					{{ character.hit_points }}
				</div>
			</div>
			<div class="speed" v-if="character.speed">
				<h6>Speed</h6>
				<div class="value">
					{{ character.speed }}<span class="ft gray-hover">ft.</span>
				</div>
			</div>
			<div class="initiative" v-if="character.initiative">
				<h6>Initiative</h6>
				<div class="value">
					<span class="gray-hover">
						{{ character.initiative >= 0 ? "+" : "-" }}</span>{{ Math.abs(character.initiative) }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'CharacterComputed',
		props: [
			"computed"
		],
		computed: {
			character() {
				return (this.computed) ? this.computed : {};
			}
		}
	}
</script>

<style lang="scss" scoped>
	.computed {
		width: 100%;
		padding: 10px;
		display: grid;
		grid-template-columns: 68px max-content 1fr;
		grid-column-gap: 15px;
		margin-bottom: 15px;

		.image {
			width: 68px;
			height: 68px;
			border: solid 1px #5c5757;
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;
		}
		.general {
			h4 {
				font-size: 18px;
				margin-bottom: 3px;
			}
		}
		.stats {
			display: flex;
			justify-content: flex-end;
			margin-right: 15px;

			.armor_class, .hit_points, .speed, .initiative  {
				margin-left: 15px;
				text-align: center;

				h6 {
					font-size: 12px;
					text-transform: uppercase;
					height: 12px;
					margin: 0;
				}
				.value {
					height: 56px;
					line-height: 56px;
					font-size: 45px;
					font-weight: bold;
				}
				.ft {
					font-size: 15px;
				}
			}
		}
	}
</style>