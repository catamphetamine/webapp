require('babel-register')

var path = require('path')
var configuration = require(path.join(__dirname, '../../code/common/configuration'))

module.exports = 
{
	database:
	{
		host     : configuration.mongodb.host,
		port     : configuration.mongodb.port,
		db       : configuration.mongodb.database,
		username : configuration.mongodb.user,
		password : configuration.mongodb.password

		// replicaSet : ["localhost:27017","localhost:27018","localhost:27019"],
		// connectionString: 'mongodb://user:password@mongo1.host.com:27018,mongo2.host.com:27018,mongo-arbiter.host.com:27018/?w=majority&amp;wtimeoutMS=10000&amp;journal=true',
	}
}