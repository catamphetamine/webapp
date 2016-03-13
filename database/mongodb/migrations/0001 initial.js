// https://github.com/afloyd/mongo-migrate

var mongodb = require('mongodb')

exports.up = function(db, next)
{
	var user_authentication   = db.collection('user_authentication')
	var authentication_tokens = db.collection('authentication_tokens')

	user_authentication.createIndex({ email: 1 }, { name: "user_by_email", unique: true })
	authentication_tokens.createIndex({ user_id: 1 }, { name: "token_by_user_id" })

	next()
}

exports.down = function(db, next)
{
	var user_authentication   = db.collection('user_authentication')
	var authentication_tokens = db.collection('authentication_tokens')

	user_authentication.dropIndex('user_by_email')
	authentication_tokens.dropIndex('token_by_user_id')

	next()
}