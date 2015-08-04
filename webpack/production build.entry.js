require('babel/register')
({
	stage: 0,
	plugins: ['typecheck']
})

module.exports = require(require('path').resolve(__dirname, 'production build'))