<template>
	<div 
        v-if="patron && patron.last_charge_status === 'Declined' && new Date(patron.pledge_end) > new Date()" 
        class="bg-red declined white"
        :class="{'hide_declined': hide}"
    >
        <div>
            <b>Payment declined!</b><br/>
            Your last payment on Patreon was declined, your subscription will automatically be cancelled on {{ makeDate(patron.pledge_end) }}.<br/>
            Go to <a href="https://www.patreon.com" target="_blank">patreon.com</a> to check your payment details.
        </div>
        <a @click="hide = true"><i class="fas fa-times"></i></a>
	</div>
</template>

<script>
    import { db } from '@/firebase'
    import { mapGetters } from 'vuex'
    import { general } from '@/mixins/general.js'

	export default {
        data() {
            return {
                hide: false
            }
        },
        mixins: [general],
        computed: {
            ...mapGetters([
				'userInfo',
            ]),
            patron() {
                if(this.userInfo) {
                    let patron_data
                    var patron = db.ref(`new_patrons`).orderByChild('email').equalTo(this.userInfo.email)
                    patron.on('value', (snapshot) => {
                        for(let key in snapshot.val()) {
                            patron_data = snapshot.val()[key];
                        }
                    });
                    return patron_data
                }
            }
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
            color: #fff !important;
        }
    }
    .hide_declined {
        display:none;
    }
</style>