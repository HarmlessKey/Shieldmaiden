export const dice = {
	data() {
		return {
			animateTrigger: false,
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
	computed: {
		dice_types() {		
			return [
				{ value: 4, text: "d4", average: this.calcAverage(4) },
				{ value: 6, text: "d6", average: this.calcAverage(6) },
				{ value: 8, text: "d8", average: this.calcAverage(8) },
				{ value: 10, text: "d10", average: this.calcAverage(10) },
				{ value: 12, text: "d12", average: this.calcAverage(12) },
			];
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

			let showRoll = (m !== 0) ? n + 'd' + d + s + m : n + 'd' + d;

			let roll = {
				roll: showRoll,
				mod: s + m,
				throws: throws,
				total: sumTotal,
			}
			
			if(notify) {
				this.animateTrigger = !this.animateTrigger;
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
		calcAverage(value, amount = 1) {
			return Math.ceil(((value + 1)/2)*amount);
		}
	}
}
