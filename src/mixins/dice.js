import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

export const dice = {
	data() {
		return {
			animateTrigger: undefined
		}
	},
	watch: {
		animateTrigger(newValue) {
			$('#roll').each(function () {
				$(this).prop('Counter',0).animate({
					Counter: $(this).text()
				}, {
					duration: 500,
					easing: 'linear',
					step: function (now) {
						$(this).text(Math.ceil(now));
					}
				});
			});
		}
	},
	methods: {
		rollD(d=20, n=1, m=0, notify=false) {
			m = parseInt(m); //Removes + from modifier
			const add = (a, b) => a + b
			let throws = []
			for (var i=0; i < n; i++) {
				throws.push(Math.ceil(Math.random() * d))
			}

			let s = ''
			if (Math.sign(m) >= 0) {
				s = '+'
			}
			let sumThrows = throws.reduce(add);
			let sumTotal = sumThrows + parseInt(m);

			let roll = {
				roll: n + 'd' + d + s + m,
				mod: s + m,
				throws: throws,
				total: sumTotal,
			}
			
			if(notify) {
				this.animateTrigger = roll.total;
				this.$snotify.html(
					`<div class="snotifyToast__body roll">
						<div class="roll_title">${notify}</div>
						<div class="rolled" id="roll">${roll.total}</div>
						<div class="roll_title">${sumThrows}${roll.mod}</div>
					</div> `, {
					timeout: 3000,
					closeOnClick: true
				});
			}
			return roll;
		},
		rollD6(n=1,m=0) {
			return this.rollD(6,n,m)
		},
		rollD8(n=1,m=0) {
			return this.rollD(8,n,m)
		},
		rollD10(n=1,m=0) {
			return this.rollD(10,n,m)
		},
		rollD20(n=1,m=0) {
			return this.rollD(20,n,m)
		},
		rollD100(n=1,m=0) {
			return this.rollD(100,n,m)
		},
	}
}
