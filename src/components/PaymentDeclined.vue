<template>
	<div 
        v-if="tier && userInfo && userInfo.patron && userInfo.patron.last_charge_status === 'Declined' && new Date(userInfo.patron.pledge_end) > new Date()" 
        class="bg-red declined white"
        :class="{'hide_declined': hide}"
    >
        <div>
            <b>Payment declined!</b><br/>
            Your last payment on Patreon was declined, your subscription will automatically be cancelled on <b>{{ makeDate(userInfo.patron.pledge_end) }}</b>.<br/>
            Go to <a href="https://www.patreon.com" target="_blank" rel="noopener">patreon.com</a> to check your payment details.
        </div>
        <a @click="hide = true"><i aria-hidden="true" class="fas fa-times"></i></a>
	</div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { general } from 'src/mixins/general.js';

	export default {
        data() {
            return {
                hide: false
            }
        },
        mixins: [general],
        computed: {
            ...mapGetters([
                'tier',
				'userInfo',
            ])
        }
	};
</script>

<style lang="scss" scoped>
    .declined {
        position: fixed;
        width: 100%;
        z-index: 9999;
        padding: 10px;
        display: flex;
        justify-content: space-between;

        a {
            color:$neutral-1 !important;
        }
    }
    .hide_declined {
        display:none;
    }
</style>