export const hkMarkdown = {
	// Mixin that parses text with markdown notation and returns an html
	data() {
		return {
		}
	},
	methods: {
		parseMarkdown(text) {
			
			let rules = [
				{ // Bold
					regex: /(\*\*|__)([^\s\*].*?)\1/g,
					repla: '<b>$2</b>'
				},
				{ // Italic
					regex: /(\*|_)([^\s\*].*?)\1/g,
					repla: '<i>$2</i>'
				},
				{ // Find and place UL
					regex: /(?:\-\s(.*?)\n)+/g,
					repla: "<ul>$&</ul>"
				},
				{
					regex: /\-\s(.*?)\n/g,
					repla: "<li>$1</li>"
				},
				{ // Parse paragraphs
					regex: /(.+)\n{2}(.+)/g,
					repla: "$1</p><p>$2"
				},
				{ // Parse breaks
					regex: /\n/g,
					repla: "<br/>"
				},
			];

			rules.forEach(function(rule) {
				text = text.replace(rule.regex, rule.repla);
			});
			text = `<p>${text}</p>`
			return text;
		}
	}
}
