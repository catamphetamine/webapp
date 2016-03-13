// https://github.com/afloyd/mongo-migrate

var mongodb = require('mongodb')

exports.up = function(resources, next)
{
	var db = resources.db
	var mongojs = resources.mongojs

	// db.user_authentication.createIndex({ email: 1 }, { name: "find_by_email" })
	// db.user_authentication.createIndex({ 'authentication_tokens.id': 1 }, { name: "find_token_by_id" })

	next()
}

exports.down = function(resources, next)
{
	var db = resources.db
	var mongojs = resources.mongojs

	next()
}