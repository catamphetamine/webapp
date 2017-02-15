var fs = require('fs')

var Min_length = 6
var Max_length = 6

var words = fs.readFileSync('input.txt', 'utf8').split('\n')

words = words.map(word => word.trim())
	.filter(word => word === word.toLowerCase())
	.filter(word => word.indexOf('-') === -1)
	.filter(word => word.indexOf('\'') === -1)
	.filter(word => word.length >= Min_length)
	.filter(word => word.length <= Max_length)

fs.writeFileSync('output.txt', words.join('\n'))