// This is an example of a simple REST Api implementation.
//
// For debugging you can use "Advanced REST Client" for Google Chrome:
// https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo

import bcrypt from 'bcrypt'
import jwt    from 'jsonwebtoken'
import uid    from 'uid-safe'

Promise.promisifyAll(bcrypt)

const users = new Map()
let id_counter = 0

function find_user_by_id(id)
{
	return Promise.resolve(users.get(id))
}

function find_user_by_email(email)
{
	for (let [user_id, user] of users)
	{
		if (user.email === email)
		{
			return Promise.resolve(user)
		}
	}

	return Promise.resolve()
}

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

function update_user(user)
{
	users.set(user.id, user)
	return Promise.resolve()
}

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

function generate_unique_jwt_id(user)
{
	const token_id = generate_jwt_id()

	if (user.authentication_tokens && user.authentication_tokens[token_id])
	{
		return generate_unique_jwt_id(user)
	}

	return token_id
}

// function generate_remember_me_token()
// {
// 	return random_string(32, '#aA!')
// }

function generate_jwt_id()
{
	return uid.sync(24)
}

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

function find_token_by_id(token_id, user_id)
{
	for (let [user_id, user] of users)
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

async function revoke_token(token_id, user_id)
{
	const user = await find_user_by_id(user_id)
	
	// for in-memory database development testing
	if (!user)
	{
		return
	}

	delete user.authentication_tokens[token_id]
}

function add_authentication_token(user, jwt_id, ip)
{
	user.authentication_tokens = user.authentication_tokens || []

	user.authentication_tokens[jwt_id] = { ip, time: new Date() }

	return Promise.resolve()
}

api.post('/sign-in', async function({ email, password }, { ip, set_cookie, keys })
{
	const user = await find_user_by_email(email)

	if (!user)
	{
		throw new Errors.Not_found(`User with email ${email} not found`)
	}

	const matches = await check_password(password, user.password)

	if (!matches)
	{
		throw new Errors.Generic(`Wrong password`) 
	}

	const jwt_id = generate_unique_jwt_id(user)

	const token = jwt.sign({}, keys[0],
	{
		subject : user.id,
		jwtid   : jwt_id
	})

	await add_authentication_token(user, jwt_id, ip)

	// http://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
	const expires = new Date(2147483647000)  // January 2038
	set_cookie('authentication', token, { expires, signed: false })

	await update_user(user)

	return { id: user.id, name: user.name }
})

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

	if (await find_user_by_email(email))
	{
		throw new Errors.Generic(`User with email ${email} already exists`)
	}

	id_counter++
	const id = String(id_counter)

	password = await hash_password(password)

	users.set(id, { id, name, email, password })

	return { id }
})

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

api.post('/authenticate', async function({}, { user, authentication_token_id, ip })
{
	// console.log('*** authenticate')

	if (!user)
	{
		// throw authentication_error
		return
	}

	user = await find_user_by_id(user.id)

	if (!user)
	{
		return
	}

	// update this authentication token's last access IP and time
	record_access(user, authentication_token_id, ip)

	return { id: user.id, name: user.name }
})

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

api.post('/sign-out', async function({}, { destroy_cookie, user, authentication_token_id })
{
	if (!user)
	{
		return
	}

	// console.log('*** user before sign out', user)

	await revoke_token(authentication_token_id, user.id)

	// console.log('*** user after sign out', user)

	destroy_cookie('authentication')
})

api.get('/validate-token', async function({}, { authentication_token_id, user })
{
	if (!user)
	{
		return { valid: false }
	}

	const token = await find_token_by_id(authentication_token_id, user.id)

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

	await record_access(user, authentication_token_id, ip)
})

async function record_access(user, authentication_token_id, ip)
{
	user = await find_user_by_id(user.id)

	const token = user.authentication_tokens[authentication_token_id]
	token.ip = ip
	token.time = new Date()

	await update_user(user)
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