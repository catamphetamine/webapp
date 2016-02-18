import jwt    from 'jsonwebtoken'

import http   from '../../common/http'

import { store, online_status_store } from '../store'

api.post('/sign-in', async function({ email, password }, { ip, set_cookie, secret })
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

	// hashing a password is a CPU-intensive lengthy operation.
	// takes about 60 milliseconds on my machine.
	//
	// maybe could be offloaded from node.js 
	// to some another multithreaded backend.
	//
	const jwt_id = store.generate_unique_jwt_id(user)

	const token = jwt.sign(configuration.authentication_token_payload.write(user) || {},
	secret,
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

	// hashing a password is a CPU-intensive lengthy operation.
	// takes about 60 milliseconds on my machine.
	//
	// maybe could be offloaded from node.js 
	// to some another multithreaded backend.
	//
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

api.post('/authenticate', async function({}, { user })
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

api.get('/validate-token', async function({ bot }, { ip, authentication_token_id, user })
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

	// if it's not an automated Http request,
	// then update this authentication token's last access IP and time
	if (!bot)
	{
		store.record_access(user, authentication_token_id, ip)
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

async function check_password(password, hashed_password)
{
	return (await http.get(`${address_book.password_service}/check`, { password, hashed_password })).result
}

async function hash_password(password)
{
	return (await http.get(`${address_book.password_service}/hash`, { password })).hash
}

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
