import jwt    from 'jsonwebtoken'

import http   from '../../common/http'

import { store, online_status_store } from '../store'

export async function sign_in({ email, password }, { ip, set_cookie, secret })
{
	if (!exists(email))
	{
		throw new Errors.Input_missing(`"email" required`)
	}

	if (!exists(password))
	{
		throw new Errors.Input_missing(`"password" required`)
	}

	const user = await store.find_user_by_email(email)

	if (!user)
	{
		throw new Errors.Not_found(`No user with this email`)
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

export async function register({ name, email, password, accept_terms_of_service })
{
	if (!exists(name))
	{
		throw new Errors.Input_missing(`"name" required`)
	}

	if (!exists(email))
	{
		throw new Errors.Input_missing(`"email" required`)
	}

	if (!exists(password))
	{
		throw new Errors.Input_missing(`"password" required`)
	}

	if (!accept_terms_of_service)
	{
		throw new Errors.Input_missing(`You must accept the terms of service`)
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
}

export function public_user(user)
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