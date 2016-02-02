// This is an example of a simple REST Api implementation.
//
// For debugging you can use "Advanced REST Client" for Google Chrome:
// https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo

import bcrypt from 'bcrypt'
import jwt    from 'jsonwebtoken'
import uid    from 'uid-safe'
import moment from 'moment'

Promise.promisifyAll(bcrypt)

import redis  from 'redis'

Promise.promisifyAll(redis)

// user's latest activity time accuracy
function round_user_access_time(time)
{
	return new Date(moment(time).seconds(0).unix() * 1000)
}

function generate_jwt_id()
{
	return uid.sync(24)
}

api.post('/sign-in', async function({ email, password }, { ip, set_cookie, keys })
{
	const user = await store.find_user_by_email(email)

	if (!user)
	{
		throw new Errors.Not_found(`User with email ${email} not found`)
	}

	const matches = await check_password(password, user.password)

	if (!matches)
	{
		throw new Errors.Generic(`Wrong password`) 
	}

	const jwt_id = store.generate_unique_jwt_id(user)

	const token = jwt.sign(configuration.authentication_token_payload.write(user) || {},
	keys[0],
	{
		subject : user.id,
		jwtid   : jwt_id
	})

	await store.add_authentication_token(user, jwt_id, ip)

	// http://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
	const expires = new Date(2147483647000)  // January 2038
	set_cookie('authentication', token, { expires, signed: false })

	await store.update_user(user)

	return public_user(user)
})

api.post('/register', async function({ name, email, password })
{
	if (!exists(name))
	{
		throw new Errors.Input_missing(`"name" not specified`)
	}

	if (!exists(email))
	{
		throw new Errors.Input_missing(`"email" not specified`)
	}

	if (!exists(password))
	{
		throw new Errors.Input_missing(`"password" not specified`)
	}

	if (await store.find_user_by_email(email))
	{
		throw new Errors.Generic(`User is already registered for this email`)
	}

	password = await hash_password(password)

	const id = store.create_user
	({
		name,
		email,
		password,

		role          : 'administrator', // 'moderator', 'senior moderator' (starting from moderator)
		moderation    : [], // [1, 2, 3, ...] (starting from moderator)
		switches      : [], // ['read_only', 'disable_user_registration', ...] (starting from senior moderator)
		// grant   : ['moderation', 'switches'] // !== true (starting from senior moderator)
		// revoke  : ['moderation', 'switches'] // !== true (starting from senior moderator)
	})

	return { id }
})

api.post('/authenticate', async function({}, { user, authentication_token_id, ip })
{
	// console.log('*** authenticate')

	if (!user)
	{
		// throw authentication_error
		return
	}

	user = await store.find_user_by_id(user.id)

	if (!user)
	{
		return
	}

	// update this authentication token's last access IP and time
	store.record_access(user, authentication_token_id, ip)

	return public_user(user)
})

api.post('/sign-out', async function({}, { destroy_cookie, user, authentication_token_id })
{
	if (!user)
	{
		return
	}

	// console.log('*** user before sign out', user)

	await store.revoke_token(authentication_token_id, user.id)

	// console.log('*** user after sign out', user)

	destroy_cookie('authentication')
})

api.get('/validate-token', async function({}, { authentication_token_id, user })
{
	if (!user)
	{
		return { valid: false }
	}

	const token = await store.find_token_by_id(authentication_token_id, user.id)

	if (!token)
	{
		return { valid: false }
	}

	return { valid: true }
})

api.post('/record-access', async function({}, { authentication_token_id, user, ip })
{
	if (!user)
	{
		return
	}

	await store.record_access(user, authentication_token_id, ip)
})

api.get('/latest-activity', async function({ user })
{
	// try to fetch user's latest activity time from the current session
	// (is faster and more precise)

	const latest_activity_time = await online_status_store.get(user)

	if (latest_activity_time)
	{
		return { time: latest_activity_time }
	}

	// if there's no current session for the user, 
	// then try to fetch user's latest activity time from the database

	user = store.find_user_by_id(user)

	if (!user)
	{
		throw new Errors.Not_found(`User not found`)
	}

	return { time: user.latest_activity_time }

	// const tokens = user.authentication_tokens || []

	// return tokens.reduce((latest, token) =>
	// {
	// 	if (!latest || token.time > latest.time)
	// 	{
	// 		return token
	// 	}
	// })
})

function public_user(user)
{
	const result =
	{
		id   : user.id,
		name : user.name,

		role       : user.role,
		moderation : user.moderation,
		switches   : user.switches
	}

	return result
}

function check_password(password, hashed_password)
{
	return bcrypt.compareAsync(password, hashed_password)
}

async function hash_password(password)
{
	const salt = await bcrypt.genSaltAsync(10)
	return await bcrypt.hashAsync(password, salt)
}

class Memory_store
{
	connect()
	{
		this.users = new Map()
		this.id_counter = 0
	}

	create_user(user)
	{
		user = Object.clone(user)

		user.id = String(this.id_counter++)

		this.users.set(user.id, user)
	}

	find_user_by_id(id)
	{
		return Promise.resolve(this.users.get(id))
	}

	find_user_by_email(email)
	{
		for (let [user_id, user] of this.users)
		{
			if (user.email === email)
			{
				return Promise.resolve(user)
			}
		}

		return Promise.resolve()
	}

	update_user(user)
	{
		this.users.set(user.id, user)
		return Promise.resolve()
	}

	generate_unique_jwt_id(user)
	{
		const token_id = generate_jwt_id()

		if (user.authentication_tokens && user.authentication_tokens[token_id])
		{
			return this.generate_unique_jwt_id(user)
		}

		return token_id
	}

	find_token_by_id(token_id, user_id)
	{
		for (let [user_id, user] of this.users)
		{
			if (exists(user.authentication_tokens))
			{
				for (let token of Object.keys(user.authentication_tokens))
				{
					if (token === token_id)
					{
						return Promise.resolve(user.authentication_tokens[token])
					}
				}
			}
		}

		return Promise.resolve()
	}

	async revoke_token(token_id, user_id)
	{
		const user = await this.find_user_by_id(user_id)
		
		// for in-memory database development testing
		if (!user)
		{
			return
		}

		delete user.authentication_tokens[token_id]
	}

	add_authentication_token(user, jwt_id, ip)
	{
		user.authentication_tokens = user.authentication_tokens || []

		const now = new Date()

		user.authentication_tokens[jwt_id] = { ip, time: now }

		// redundant field for faster latest activity time querying
		user.latest_activity_time = now

		return Promise.resolve()
	}

	async record_access(user, authentication_token_id, ip)
	{
		user = await store.find_user_by_id(user.id)

		const now = round_user_access_time(new Date())

		// update user's online status
		let previous_time = await online_status_store.get_and_set(user.id, new Date())

		if (previous_time)
		{
			previous_time = round_user_access_time(previous_time)
		}

		// console.log('*** previous user access time', previous_time)
		// console.log('*** now user access time', now)

		// if enough time has passed to update this user's latest activity time,
		// then update it
		if (!previous_time || now.getTime() > previous_time.getTime())
		{
			// console.log('*** updating user access time')

			// if (previous_time)
			// {
			// 	console.log('*** previous_time.getTime()', previous_time.getTime())
			// }

			// update access time for this authentication token
			const token = user.authentication_tokens[authentication_token_id]
			token.ip = ip
			token.time = now

			// redundant field for faster latest activity time querying
			user.latest_activity_time = now

			await store.update_user(user)
		}
	}
}

class Mongodb_store
{
	connect()
	{
	}
}

class Memory_online_status_store
{
	connect()
	{
		this.user_sessions = {}
	}

	get(user_id)
	{
		return Promise.resolve(this.user_sessions[user_id])
	}

	get_and_set(user_id, time)
	{
		const previous_time = this.user_sessions[user_id]
		this.user_sessions[user_id] = time
		return Promise.resolve(previous_time)
	}
}

class Redis_online_status_store
{
	prefix = 'user:session:'
	ttl = 10 * 60 // 10 minutes

	connect()
	{
		this.client = redis.createClient
		({
			host      : configuration.redis.host,
			port      : configuration.redis.port,
			auth_pass : configuration.redis.password
		})
	}

	get(user_id)
	{
		return this.client
			.get(this.prefix + user_id)
			.then(result => result ? new Date(result) : null)
	}

	get_and_set(user_id, time)
	{
		return this.client.multi()
			.getset(this.prefix + user_id, time.toISOString())
			.expire(this.prefix + user_id, this.ttl)
			.execAsync()
			.then(result => result[0] ? new Date(result[0]) : null)
	}
}

const store = configuration.mongodb ? new Mongodb_store() : new Memory_store()
store.connect()

const online_status_store = configuration.redis ? new Redis_online_status_store() : new Memory_online_status_store()
online_status_store.connect()

// if (online_status_store instanceof Memory_online_status_store)
// {
// 	log.warn('Redis connection not configured. Therefore user online status is stored in RAM.')
// }

// old session based code
//
// function find_user_by_remember_me_token(remember_me_token)
// {
// 	for (let [user_id, user] of users)
// 	{
// 		if (exists(user.remember_me))
// 		{
// 			for (let token of Object.keys(user.remember_me))
// 			{
// 				if (token === remember_me_token)
// 				{
// 					return user
// 				}
// 			}
// 		}
// 	}
// }
//
// function find_user_remember_me_token_by_session_id(user, session_id)
// {
// 	if (user.remember_me)
// 	{
// 		for (let token of Object.keys(user.remember_me))
// 		{
// 			if (user.remember_me[token].session === session_id)
// 			{
// 				return token
// 			}
// 		}
// 	}
// }
//
// function generate_remember_me_token()
// {
// 	return random_string(32, '#aA!')
// }
//
// // http://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
// function random_string(length, chars)
// {
// 	let mask = ''
//
// 	if (chars.has('a')) mask += 'abcdefghijklmnopqrstuvwxyz'
// 	if (chars.has('A')) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
// 	if (chars.has('#')) mask += '0123456789'
// 	if (chars.has('!')) mask += '~`!@#$%^&*()_+-={}[]:"\'<>?,./|\\'
//
// 	let result = ''
// 	for (let i = length; i > 0; --i)
// 	{
// 		result += mask[Math.floor(Math.random() * mask.length)]
// 	}
//
// 	return result
// }
//
// function user_signed_in(user, remember_me_token, ip, session, session_id, set_cookie)
// {
// 	// if we came here from `sign_in` method (not from `authenticate` method)
// 	if (!remember_me_token)
// 	{
// 		remember_me_token = generate_remember_me_token()
//
// 		// http://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
// 		const expires = new Date(2147483647000)  // January 2038
// 		set_cookie('remember_me', remember_me_token, { expires })
// 	}
//
// 	user.remember_me = user.remember_me || {}
// 	user.remember_me[remember_me_token] = { ip, time: new Date(), session: session_id }
//
// 	session.user = { id: user.id, name: user.name }
//
// 	update_user(user)
// }

// (session based user authentication)
//
// api.post('/sign-in', async function({ email, password }, { session, session_id, ip, set_cookie })
// {
// 	const user = await find_user_by_email(email)
//
// 	if (!user)
// 	{
// 		throw new Errors.Not_found(`User with email ${email} not found`)
// 	}
//
// 	const matches = await check_password(password, user.password)
//
// 	if (!matches)
// 	{
// 		throw new Errors.Generic(`Wrong password`) 
// 	}
//
// 	user_signed_in(user, undefined, ip, session, session_id, set_cookie)
//
// 	return session.user
// })

// (session based user authentication)
//
// api.post('/authenticate', async function({}, { session, session_id, ip, get_cookie, set_cookie, destroy_cookie })
// {
// 	// console.log('*** authenticate. session', session, 'id', session_id)
//
// 	if (!session.user)
// 	{
// 		const remember_me_token = get_cookie('remember_me')
// 		const user = find_user_by_remember_me_token(remember_me_token)
//
// 		if (!user)
// 		{
// 			destroy_cookie('remember_me')
// 			return
// 		}
//
// 		user_signed_in(user, remember_me_token, ip, session, session_id, set_cookie)
// 	}
//
// 	return { id: session.user.id, name: session.user.name }
// })

// (session based user authentication)
//
// api.post('/sign-out', function({}, { session, session_id, destroy_session, destroy_cookie })
// {
// 	const user = session.user ? find_user_by_id(session.user.id) : undefined
//
// 	if (!user)
// 	{
// 		return
// 	}
//
// 	// console.log('*** user before sign out', user)
//
// 	const remember_me_token = find_user_remember_me_token_by_session_id(user, session_id)
//
// 	if (remember_me_token)
// 	{
// 		delete user.remember_me[remember_me_token]
// 		update_user(user)
// 	}
//
// 	// console.log('*** user after sign out', user)
//
// 	destroy_cookie('remember_me')
//
// 	destroy_session()
// })
