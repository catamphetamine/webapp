// import { lookup_ip } from '../../../code/geocoding'

export function get_user(user_id)
{
	const action =
	{
		promise : http => http.get(`/users/${user_id}`),
		event   : 'user settings: get user'
	}

	return action
}

export function revoke_authentication_token(token_id)
{
	const action =
	{
		promise : http => http.post(`/authentication/revoke-token`, { id: token_id }),
		event   : 'user settings: revoke authentication token'
	}

	return action
}

export function change_email(email)
{
	const action =
	{
		promise : http => http.patch(`/users/email`, { email }),
		event   : 'user settings: save settings'
	}

	return action
}

export function get_user_authentication_tokens()
{
	const action =
	{
		promise : async http =>
		{
			const { tokens } = await http.get(`/authentication/tokens`)

			// Geocoding currently doesn't work on the client side
			// https://github.com/nchaulet/node-geocoder/issues/187
			//
			// await Promise.all(tokens.map(async token =>
			// {
			// 	for (let access of token.history)
			// 	{
			// 		const place = await lookup_ip(access.ip)
			//
			// 		access.city    = place.city
			// 		access.country = place.country
			// 	}
			//
			// 	return token
			// }))

			return { tokens }
		},
		event   : 'user settings: get user authentication tokens'
	}

	return action
}