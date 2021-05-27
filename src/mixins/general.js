import numeral from 'numeral';

export const general = {
	methods: {
		calcMod(val) {
			if(val) {
				return Math.floor((val - 10) / 2)
			}
			else {
				return 0;
			}	
		},
		hitDiceStr(npc) {
			let mod = this.calcMod(npc['constitution']);
			let nHD = parseInt(npc.hit_dice.split('d')[0]);
			let hdMod = mod * nHD;

			let sign = (hdMod > 0) ? '+' : '';
			let mod_str = hdMod ? hdMod : '';
			
			return "" + npc.hit_dice + sign + mod_str;
		},
		percentage(current, max) {
			var percentage = Math.floor(current / max * 100)
			return percentage
		},
		makeDate(input, showTime = false, short = false) {
			let monthNames = [
				"January", "February", "March",
				"April", "May", "June", "July",
				"August", "September", "October",
				"November", "December"
			];

			let d = new Date(input)
			let hours = (d.getHours() < 10) ? '0'+d.getHours() : d.getHours();
			let minutes = (d.getMinutes() < 10) ? '0'+d.getMinutes() : d.getMinutes();
			// let seconds = (d.getSeconds() < 10) ? '0'+d.getSeconds() : d.getSeconds();

			let time = hours + ":" + minutes;
			let date = (short) ?
			d.getDate() + "-" + parseInt(d.getMonth() + 1) + "-" + d.getFullYear() :
			monthNames[d.getMonth()] + " " + numeral(d.getDate()).format('0o') + " " + d.getFullYear();
			
			if(showTime) { return date + " at " + time; }
			return date
		},
		toKebabCase(input) {
			return input.replace(/(a-z)(A-Z)/g, "$1-$2")
									.replace(/\s+/g, '-')
									.toLowerCase();
		}
	}
}
