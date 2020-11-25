import { mapActions } from 'vuex';

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
		...mapActions([
			'setRoll'
		]),
		rollD(e, d=20, n=1, m=0, title, notify=false, advantage_disadvantage={}) {
			m = parseInt(m); //Removes + from modifier
			const add = (a, b) => a + b;
			let throws = [];
			let ignored = undefined;
			
			//Check for advantage with advantage or disadvantage when a single d20 is rolled
			if(n === 1 && d === 20 && (e.shiftKey || e.ctrlKey)) {
				const type = (e.shiftKey) ? "advantage" : "disadvantage";
				advantage_disadvantage[type] = true;

				//Only roll with advantage/disadvantage if only 1 is present they cancel eachother out
				if(Object.keys(advantage_disadvantage).length === 1) {
					n = 2;
				}
			} else {
				advantage_disadvantage = {};
			}
			
			//Roll the dice
			for (var i=0; i < n; i++) {
				throws.push(Math.ceil(Math.random() * d))
			}

			//Roll with advantage/disadvantage
			if(Object.keys(advantage_disadvantage).length === 1) {
				let ignoredRoll = (throws[0] < throws[1]) ? 0 : 1; //ignore the lowest roll
				
				//With disadvantage, ignore the highest roll
				if(advantage_disadvantage.disadvantage) {
					ignoredRoll = (throws[0] > throws[1]) ? 0 : 1;
				}

				ignored = throws[ignoredRoll];
				throws.splice(ignoredRoll, 1);
				n = 1;
			}

			let s = ''
			if (Math.sign(m) >= 0) {
				s = '+'
			}
			const sumThrows = throws.reduce(add);
			const sumTotal = sumThrows + parseInt(m);

			const showRoll = (m !== 0) ? `${n}d${d}${s}${m}` : `${n}d${d}`;

			const roll = {
				title,
				roll: showRoll,
				mod: s + m,
				throws: throws,
				throwsTotal: sumThrows,
				total: sumTotal,
				advantage_disadvantage,
				ignored
			}

			console.log(roll)
			
			if(notify) {
				let advantage;
				if(ignored) {
					const type = Object.keys(advantage_disadvantage)[0].charAt(0).capitalize();
					const color = (type === "A") ? "green" : "red";
					advantage = `<b class="${color}">${type}</b> <span class="gray-hover">${ignored}</span> `;
				}

				this.animateTrigger = !this.animateTrigger;
				this.$snotify.html(
					`<div class="snotifyToast__body roll">
						<div class="roll_title">${title}</div>
						<div class="rolled" id="roll">${roll.total}</div>
						<div class="roll_title">${advantage ? advantage : ''}${sumThrows}${roll.mod}</div>
					</div> `, {
					timeout: 3000,
					closeOnClick: true
				});
				this.rolled = roll.total;
			}
			this.setRoll(roll);
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
