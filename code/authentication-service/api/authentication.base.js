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
		throw new Errors.Input_rejected(`Wrong password`) 
	}

	const jwt_id = await store.add_authentication_token(user, ip)

	const token = jwt.sign(configuration.authentication_token_payload.write({ ...user_data, ...user }) || {},
	secret,
	{
		subject : user.id,
		jwtid   : jwt_id
	})

	set_cookie('authentication', token, { signed: false })

	const user_data = await get_user(http, user.id, token)

	if (!user_data.id)
	{
		throw new Errors.Not_found(`No user with this id`)
	}

	return own_user(user_data)
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

export function own_user(user)
{
	const fields =
	[
		'id',
		'name',
		'picture',
		'role',
		// 'moderation',
		// 'switches',
		'locale'
	]

	const result = {}

	for (let key of fields)
	{
		result[key] = user[key]
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

	return (await http.get(`${address_book.user_service}/${id}`, undefined, extra))
}

async function create_user(user)
{
	return (await http.post(address_book.user_service, user))
}