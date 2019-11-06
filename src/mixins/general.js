export const general = {
	created() {
		// console.log("CREATED MIXIN")
	},
	methods: {
		calcMod(val) {
			if(val) {
				return Math.floor((val - 10) / 2)
			}
			else {
				return 0;
			}	
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
			let seconds = (d.getSeconds() < 10) ? '0'+d.getSeconds() : d.getSeconds();

			let time = hours + ":" + minutes + ":" + seconds;
			let date = (short) ?
			d.getDate() + "-" + parseInt(d.getMonth() + 1) + "-" + d.getFullYear() :
			d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
			
			if(showTime) { return date + " - " + time; }
			return date
		},
	}
}
