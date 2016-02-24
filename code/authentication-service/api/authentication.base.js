import uid    from 'uid-safe'
import jwt    from 'jsonwebtoken'

import http   from '../../common/http'

import { store, online_status_store } from '../store'

export async function sign_in({ email, password }, { ip, set_cookie, secret, http })
{
	if (!exists(email))
	{
		throw new Errors.Input_missing(`"email" is required`)
	}

	if (!exists(password))
	{
		throw new Errors.Input_missing(`"password" is required`)
	}

	const user = await store.find_user_by_email(email)

	if (!user)
	{
		throw new Errors.Not_found(`No user with this email`)
	}

	const matches = await check_password(password, user.password)

	if (!matches)
	{
		throw new Errors.Error(`Wrong password`) 
	}

	// hashing a password is a CPU-intensive lengthy operation.
	// takes about 60 milliseconds on my machine.
	//
	// maybe could be offloaded from node.js 
	// to some another multithreaded backend.
	//
	const jwt_id = generate_unique_jwt_id(user)

	const token = jwt.sign(configuration.authentication_token_payload.write({ ...user_data, ...user }) || {},
	secret,
	{
		subject : user.id,
		jwtid   : jwt_id
	})

	await store.add_authentication_token(user, jwt_id, ip)

	// http://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
	const expires = new Date(2147483647000)  // January 2038
	set_cookie('authentication', token, { expires, signed: false })

	const user_data = await get_user(http, user.id, token)

	if (!user_data.id)
	{
		throw new Errors.Not_found(`No user with this id`)
	}

	// await store.update_user(user)

	return own_user(user_data, user.id)
}

export async function sign_out({}, { destroy_cookie, user, authentication_token_id })
{
	if (!user)
	{
		return
	}

	// console.log('*** user before sign out', user)

	await store.revoke_token(authentication_token_id, user.id)

	// console.log('*** user after sign out', user)

	destroy_cookie('authentication')
}

export async function register({ name, email, password, terms_of_service_accepted })
{
	if (!exists(name))
	{
		throw new Errors.Input_missing(`"name" is required`)
	}

	if (!exists(email))
	{
		throw new Errors.Input_missing(`"email" is required`)
	}

	if (!exists(password))
	{
		throw new Errors.Input_missing(`"password" is required`)
	}

	if (!terms_of_service_accepted)
	{
		throw new Errors.Input_missing(`You must accept the terms of service`)
	}

	if (await store.find_user_by_email(email))
	{
		throw new Errors.Error(`User is already registered for this email`)
	}

	// hashing a password is a CPU-intensive lengthy operation.
	// takes about 60 milliseconds on my machine.
	//
	// maybe could be offloaded from node.js 
	// to some another multithreaded backend.
	//
	password = await hash_password(password)

	const privileges =
	{
		role          : 'administrator', // 'moderator', 'senior moderator' (starting from moderator)
		// moderation    : [], // [1, 2, 3, ...] (starting from moderator)
		// switches      : [], // ['read_only', 'disable_user_registration', ...] (starting from senior moderator)
		// grant   : ['moderation', 'switches'] // !== true (starting from senior moderator)
		// revoke  : ['moderation', 'switches'] // !== true (starting from senior moderator)
	}

	const user =
	{
		email,
		password,
		...privileges
	}

	const id = await store.create_user(user)

	const user_data = 
	{
		id, 
		name,
		email,
		...privileges
	}

	await create_user(user_data)

	return { id }
}

export function own_user(user, id)
{
	const result = 
	{
		id         : user.id || id,

		name       : user.name,

		role       : user.role,
		// moderation : user.moderation,
		// switches   : user.switches
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

export async function get_user(http, id, token)
{
	let extra

	if (token)
	{
		extra = { headers: { Authorization: `Bearer ${token}` } }
	}

	return (await http.get(`${address_book.user_service}/users/${id}`, undefined, extra))
}

async function create_user(user)
{
	return (await http.post(`${address_book.user_service}/users`, user))
}

function generate_unique_jwt_id(user)
{
	const token_id = generate_jwt_id()

	if (user.authentication_tokens && user.authentication_tokens[token_id])
	{
		return this.generate_unique_jwt_id(user)
	}

	return token_id
}

function generate_jwt_id()
{
	return uid.sync(24)
}