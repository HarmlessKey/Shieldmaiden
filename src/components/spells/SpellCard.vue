<template>
	<div
		v-if="back"
		class="spell-card back"
		:style="{
			'--card-color': shades.base,
			'--card-color-lighter': shades.lighter,
			'--card-color-light': shades.light,
			'--card-color-dark': shades.dark,
			'--card-color-darker': shades.darker,
			'--card-color-darkest': shades.darkest,
		}"
	>
		<div class="spell-card__level">{{ spell.level }}</div>
		<img class="spell-card__logo" :src="back_logo_src" alt="Shieldmaiden logo" />
		<div class="spell-card__domain">https://shieldmaiden.app</div>
		<div class="spell-card__level">
			<div>{{ spell.level }}</div>
		</div>
	</div>
	<div
		v-else
		class="spell-card"
		:style="{
			'--card-color': shades.base,
			'--card-color-lighter': shades.lighter,
			'--card-color-light': shades.light,
			'--card-color-dark': shades.dark,
			'--card-color-darker': shades.darker,
			'--card-color-darkest': shades.darkest,
		}"
	>
		<div class="spell-card__header truncate">
			{{ spell.name }}
		</div>
		<div class="spell-card__subheader">
			<template v-if="spell.level === 0">Cantrip </template>
			<template v-else>{{ spell.level | numeral("0o") }}-level </template>
			{{ spell.school }}
			<span v-if="spell.ritual">(ritual)</span>
		</div>

		<div class="spell-card__info">
			<div>
				<div class="spell-card__info__label">Casting time</div>
				{{ spell.cast_time }}
				{{ spell.cast_time_type }}
			</div>
			<div>
				<div class="spell-card__info__label">Range</div>
				{{ range }}
			</div>
			<div v-if="spell.components">
				<div class="spell-card__info__label">Components</div>
				{{ spell.components.map((comp) => comp.charAt(0).toUpperCase()).join(", ") }}
			</div>
			<div>
				<div class="spell-card__info__label">
					Duration
					<span v-if="spell.duration_type === 'concentration'" class="concentration">C</span>
				</div>
				{{ duration }}
			</div>
		</div>

		<div class="spell-card__description">
			<div v-if="spell.material_description" class="mb-2">
				Material: {{ spell.material_description }}
			</div>
			<textarea
				v-if="editable"
				class="spell-card__description-input"
				:value="spell.description"
				@input="$emit('update:description', $event.target.value)"
			/>
			<hk-markdown-editor v-else :value="spell.description" read-only />
		</div>
		<template v-if="spell.higher_level">
			<div class="spell-card__subheader">At Higher Levels</div>
			<div class="spell-card__higher-levels">
				{{ spell.higher_level }}
			</div>
		</template>

		<div class="spell-card__footer">
			<span class="spell-card__footer__domain">https://shieldmaiden.app</span>
			<img class="spell-card__footer__logo" :src="logo_src" alt="Shieldmaiden logo" />
		</div>

		<!-- <div v-if="spell.source" class="spell-card__source">{{ spell.source }}</div> -->
	</div>
</template>

<script>
import { spell_card_colors } from "src/utils/spellConstants";
import logoCyan from "src/assets/_img/logo/logo-icon-no-shield-cyan.svg";
import logoBlue from "src/assets/_img/logo/logo-icon-no-shield-blue.svg";
import logoYellow from "src/assets/_img/logo/logo-icon-no-shield-yellow.svg";
import logoRed from "src/assets/_img/logo/logo-icon-no-shield-red.svg";
import logoOrange from "src/assets/_img/logo/logo-icon-no-shield-orange.svg";
import logoGreen from "src/assets/_img/logo/logo-icon-no-shield-green.svg";
import logoGray from "src/assets/_img/logo/logo-icon-no-shield-gray.svg";
import logoShieldCyan from "src/assets/_img/logo/logo-cyan.svg";
import logoShieldBlue from "src/assets/_img/logo/logo-blue.svg";
import logoShieldYellow from "src/assets/_img/logo/logo-yellow.svg";
import logoShieldRed from "src/assets/_img/logo/logo-red.svg";
import logoShieldOrange from "src/assets/_img/logo/logo-orange.svg";
import logoShieldGreen from "src/assets/_img/logo/logo-green.svg";
import logoShieldGray from "src/assets/_img/logo/logo-gray.svg";

// The "print" palette has no matching brand color, it uses the grayscale icon instead.
const logo_sources = {
	cyan: logoCyan,
	blue: logoBlue,
	yellow: logoYellow,
	red: logoRed,
	orange: logoOrange,
	green: logoGreen,
	print: logoGray,
};

// Card back uses the shielded logo mark. There's no shielded gray variant, so "print"
// still falls back to the plain grayscale icon.
const logo_shield_sources = {
	cyan: logoShieldCyan,
	blue: logoShieldBlue,
	yellow: logoShieldYellow,
	red: logoShieldRed,
	orange: logoShieldOrange,
	green: logoShieldGreen,
	print: logoShieldGray,
};

export default {
	name: "SpellCard",
	props: {
		spell: {
			type: Object,
			required: true,
		},
		color: {
			type: String,
			default: "print",
			validator: (value) => spell_card_colors.some(({ value: v }) => v === value),
		},
		// Renders the description as an editable textarea instead of read-only markdown,
		// so overflowing text can be trimmed to fit the fixed card size before download.
		editable: {
			type: Boolean,
			default: false,
		},
		back: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		shades() {
			return spell_card_colors.find(({ value }) => value === this.color) || spell_card_colors[0];
		},
		logo_src() {
			return logo_sources[this.color] || logo_sources.cyan;
		},
		back_logo_src() {
			return logo_shield_sources[this.color] || logo_shield_sources.cyan;
		},
		duration() {
			const type = this.spell.duration_type;
			const n = this.spell.duration;
			const scale = this.spell.duration_scale;

			if (type === "concentration") {
				let dur_scale = n === 1 ? scale : scale + "s";
				return `Up to ${n} ${dur_scale}`;
			}
			if (type === "Time") {
				let dur_scale = n === 1 ? scale : scale + "s";
				return `${n} ${dur_scale}`;
			}
			return type;
		},
		range() {
			const type = this.spell.range_type;
			const range = this.spell.range;

			if (type === "ranged") {
				return `${range} feet`;
			}

			return type;
		},
	},
};
</script>

<style lang="scss" scoped>
.spell-card {
	width: 2.5in;
	height: 3.5in;
	overflow: hidden;
	color: var(--card-color-darkest);
	padding: 1em;
	background-color: var(--card-color);
	font-size: 9px;
	display: flex;
	flex-direction: column;

	&.back {
		background-color: var(--card-color-light);
		color: var(--card-color-dark);
		justify-content: space-between;
		align-items: center;

		.spell-card {
			&__logo-wrap {
				position: relative;
				margin: 0 auto;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			&__logo {
				width: 80%;
				height: auto;
			}
			&__domain {
				font-size: 1.25em;
				text-align: center;
				font-style: italic;
				font-weight: bold;
				margin-top: 0.5em;
			}
			&__level {
				font-size: 6em;
				line-height: 1em;
				font-weight: bold;
				flex-grow: 1;
				width: 100%;

				&:last-child {
					text-align: right;
					display: flex;
					flex-direction: column;
					justify-content: flex-end;
				}
			}
		}
	}
	&__header,
	&__description,
	&__higher-levels {
		background-color: var(--card-color-lighter);
		padding: 0.5em;
	}
	&__header {
		padding: 0.25em;
		font-size: 1.25em;
		min-height: 2em;
		font-weight: bold;
		text-align: center;
		border-top-left-radius: 0.5em;
		border-top-right-radius: 0.5em;
	}
	&__subheader {
		text-align: center;
		line-height: 1.5em;
	}
	&__info {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2em;
		text-align: center;
		margin-bottom: 1em;

		> div {
			background-color: var(--card-color-lighter);
			padding: 0.25em;
			width: calc(50% - 0.1em);
			font-weight: bold;
		}
		&__label {
			font-weight: normal;
		}
		.concentration {
			font-weight: bolder;
			display: inline-block;
			padding: 0 0.3em;
			border-radius: 0.2em;
			color: var(--card-color-lighter);
			background-color: var(--card-color-dark);
		}
	}
	&__description {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		&:nth-last-child(2) {
			border-bottom-left-radius: 0.5em;
			border-bottom-right-radius: 0.5em;
		}
	}
	&__description-input {
		flex-grow: 1;
		width: 100%;
		border: none;
		outline: none;
		resize: none;
		background: transparent;
		color: inherit;
		font-family: inherit;
		font-size: 1em;
		line-height: 1.4em;
		padding: 0;
	}
	&__higher-levels {
		border-bottom-left-radius: 0.5em;
		border-bottom-right-radius: 0.5em;
	}
	&__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 1em;
		font-size: 0.75em;
		margin-bottom: -0.5em;

		&__domain {
			font-style: italic;
		}
		&__logo {
			height: 1.5em;
			width: auto;
		}
	}
	&__source {
		font-size: 0.85em;
		text-align: right;
	}
}
</style>
