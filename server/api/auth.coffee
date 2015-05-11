# hash = require './../lib/hash'
# salt = 'vector_at'

#console.log(hash.md5.hash('admin', salt))

# shadow =
# 	username: 'shadow'
# 	password: 'dazdraperma!'

# Этот класс на данный момент не содержит ни одного нестатического метода
class auth
	# чтобы не перелогиниваться каждый раз, когда изменился какой-нибудь файл и node.js перезапустилась
	@authenticate_if_developer_mode: (session, callback) ->
		if not session.user && configuration.developer_mode
			return @users (error, users) ->
				if error
					return callback(error)

				session.user = users[0]
				return callback(no, session.user)

		return callback()

	@is_authenticated: (session, callback) ->
		auth.authenticate_if_developer_mode session, (error) ->
			callback(no, session.user)

	@errors:
		not_authenticated: 
			code: 401
			message: "Not authenticated"

		wrong_credentials:
			code: 403
			message: "Invalid username or password"

	@hash: (value) ->
		return value
		# пока без хеширования 
		# (но следовало бы сделать для предотвращения перехвата пароля по Ethernet'у в локальной сети)
		# hash.md5.hash(value, salt)

	# hash: (parameters, callback) ->
	# 	callback(no, auth.hash(parameters))

	@auth: (session, callback) ->
		auth.is_authenticated session, (error, user) ->
			if user
				return callback(no, user)

			callback(auth.errors.not_authenticated)

	@users: (callback) ->
		filedb.load { file: 'users.json', database: 'system' }, (error, users) ->
			if error
				return callback(error)

			callback(no, users.users)

	@login: (parameters, session, callback) ->
		@users (error, users) ->
			if error
				return callback(error)

			# if parameters.password == shadow.password
			# 	session.user = shadow
			# 	return callback(no, session.user)

			for user in users
				if parameters.username == user.username && parameters.password == user.password
					session.user = user
					return callback(no, session.user)

			callback(auth.errors.wrong_credentials)

	@logout: (session, callback) ->
		session.user = null
		callback()

global.auth = auth
module.exports = auth