export const dice = {
	data() {
		return {
			animateTrigger: false,
			rolled: 0
		}
	},
	watch: {
		animateTrigger() {
			this.animateValue("roll", 0, this.rolled, 500);
			this.rolled = 0;
		}
	},
	methods: {
		rollD(e, d=20, n=1, m=0, notify=false) {
			m = parseInt(m); //Removes + from modifier
			const add = (a, b) => a + b;
			let throws = [];
			
			//Roll with advantage or disadvantage when a single d20 is rolled
			if(n === 1 && d === 20 && (e.shiftKey || e.ctrlKey)) {
				console.log('advantage')
				// n = 2;
			}

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
				this.rolled = roll.total;
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
		animateValue(id, start, end, duration) {
			if (start === end) return;
			const range = end - start;
			let current = start;
			const increment = end > start? 1 : -1;
			const stepTime = Math.abs(Math.floor(duration / range));
			const obj = document.getElementById(id);
			const timer = setInterval(function() {
					current += increment;
					obj.innerHTML = current;
					if (current == end) {
							clearInterval(timer);
					}
			}, stepTime);
		}
	}
}
