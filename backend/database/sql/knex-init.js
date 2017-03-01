var path = require('path')
var fs = require('fs')

var configuration =
`
var path = require('path')

module.exports =
{
	client: 'postgresql',
	connection:
	{
		database: 'webapp',
		user:     'webapp',
		password: 'webapp'
	},
	pool:
	{
		min: 2,
		max: 10
	},
	migrations:
	{
		directory: path.join(__dirname, 'database/sql/migrations'),
		tableName: 'knex_migrations'
	}
}
`

fs.writeFileSync(path.resolve(__dirname, 'knexfile.js'), configuration.trim())