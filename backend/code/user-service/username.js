export default async function generate_username(email, checker)
{
	const max_length = 32

	let username

	const at_index = email.indexOf('@')
	if (at_index >= 0)
	{
		username = email.slice(0, at_index)
	}
	else
	{
		// (incorrect email address)
		username = email
	}

	if (username.length > max_length)
	{
		username = username.slice(0, max_length)
	}

	if (await checker(username))
	{
		return username
	}

	// http://csbruce.com/software/utf-8.html
	const random_symbols = '⬠⬡⬦⟁∀∞≈≡⏣◯☆♤✡✓✹♘࿊ᐁ'

	function find_random_symbols_position(username, skip = 0)
	{
		if (skip === username.length)
		{
			return 0
		}

		for (let symbol of random_symbols)
		{
			if (username[username.length - 1 - skip] === symbol)
			{
				return find_random_symbols_position(username, skip + 1)
			}
		}

		return username.length - skip
	}

	function add_random_symbol(username, random_symbol)
	{
		if (username.length < max_length)
		{
			return username + random_symbol
		}

		const random_symbols_position = find_random_symbols_position(username)

		if (random_symbols_position === 0)
		{
			return
		}

		return username.slice(0, random_symbols_position - 1) + username.slice(random_symbols_position) + random_symbol
	}

	async function find_unique_username_for_base(username, recursions_left)
	{
		for (let symbol of random_symbols)
		{
			const username_try = add_random_symbol(username, symbol)

			if (await checker(username_try))
			{
				return username_try
			}
		}

		if (recursions_left > 0)
		{
			recursions_left--

			for (let symbol of random_symbols)
			{
				const result = await find_unique_username_for_base(add_random_symbol(username, symbol), recursions_left)

				if (result)
				{
					return result
				}
			}
		}
	}

	let recursions_left = 0
	while (recursions_left < max_length)
	{
		const result = await find_unique_username_for_base(username, recursions_left)

		if (result)
		{
			return result
		}

		recursions_left++
	}

	throw new Error(`Couldn't generate a unique username for email ${email}`)
}

async function generate_username_test()
{
	generate_username('kuchumovn@gmail.com', async (username) =>
	{
		if (username.length < 11)
		{
			return false
		}
	})

	if (await generate_username('kuchumovn@gmail.com', async username => true) !== 'kuchumovn')
	{
		throw new Error('Self-test failed')
	}

	if (await generate_username('kuchumovn@gmail.com', async username => username !== 'kuchumovn') !== 'kuchumovn⬠')
	{
		throw new Error('Self-test failed')
	}

	if (await generate_username('kuchumovn012345678901234567890@gmail.com', async username => username === 'kuchumovn01234567890123456789⬠⬡⬦') !== 'kuchumovn01234567890123456789⬠⬡⬦')
	{
		throw new Error('Self-test failed')
	}

	if (await generate_username('kuchumovn@gmail.com', async (username) =>
	{
		if (username.length === 12)
		{
			return true
		}
	})
	!== 'kuchumovn⬠⬠⬠')
	{
		throw new Error('Self-test failed')
	}

	console.log('Generate unique username tests passed')
}

// generate_username_test().catch(error => console.error(error))