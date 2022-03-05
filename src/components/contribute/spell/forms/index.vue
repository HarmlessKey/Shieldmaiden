<template>
	<div class="form">
		<BasicInfo v-model="spell" />
		<SpellActions v-model="spell" />
	</div>
</template>

<script>
import BasicInfo from '@/components/contribute/spell/forms/BasicInfo';
import SpellActions from '@/components/contribute/spell/forms/actions';

export default {
	name: 'EditSpell',
	components: {
		BasicInfo,
		SpellActions,
	},
	props: { spell: Object },
}
</script>