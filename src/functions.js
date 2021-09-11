String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.capitalizeEach = function(sep=' ') {
	return this.split(sep).map((s) => s.capitalize()).join(sep);
}

Array.min = function( array ){
	return Math.min.apply( Math, array );
};