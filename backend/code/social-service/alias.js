export default async function generate_alias(email, checker)
{
	const max_length = 32

	let alias

	const at_index = email.indexOf('@')
	if (at_index >= 0)
	{
		alias = email.slice(0, at_index)
	}
	else
	{
		// (incorrect email address)
		alias = email
	}

	if (alias.length > max_length)
	{
		alias = alias.slice(0, max_length)
	}

	if (await checker(alias))
	{
		return alias
	}

	// http://csbruce.com/software/utf-8.html
	const random_symbols = '⬠⬡⬦⟁∀∞≈≡⏣◯☆♤✡✓✹♘࿊ᐁ'

	function find_random_symbols_position(alias, skip = 0)
	{
		if (skip === alias.length)
		{
			return 0
		}

		for (let symbol of random_symbols)
		{
			if (alias[alias.length - 1 - skip] === symbol)
			{
				return find_random_symbols_position(alias, skip + 1)
			}
		}

		return alias.length - skip
	}

	function add_random_symbol(alias, random_symbol)
	{
		if (alias.length < max_length)
		{
			return alias + random_symbol
		}

		const random_symbols_position = find_random_symbols_position(alias)

		if (random_symbols_position === 0)
		{
			return
		}

		return alias.slice(0, random_symbols_position - 1) + alias.slice(random_symbols_position) + random_symbol
	}

	async function find_unique_alias_for_base(alias, recursions_left)
	{
		for (let symbol of random_symbols)
		{
			const alias_try = add_random_symbol(alias, symbol)

			if (await checker(alias_try))
			{
				return alias_try
			}
		}

		if (recursions_left > 0)
		{
			recursions_left--

			for (let symbol of random_symbols)
			{
				const result = await find_unique_alias_for_base(add_random_symbol(alias, symbol), recursions_left)

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
		const result = await find_unique_alias_for_base(alias, recursions_left)

		if (result)
		{
			return result
		}

		recursions_left++
	}

	throw new Error(`Couldn't generate a unique alias for email ${email}`)
}

async function generate_alias_test()
{
	generate_alias('kuchumovn@gmail.com', async (alias) =>
	{
		if (alias.length < 11)
		{
			return false
		}
	})

	if (await generate_alias('kuchumovn@gmail.com', async alias => true) !== 'kuchumovn')
	{
		throw new Error('Self-test failed')
	}

	if (await generate_alias('kuchumovn@gmail.com', async alias => alias !== 'kuchumovn') !== 'kuchumovn⬠')
	{
		throw new Error('Self-test failed')
	}

	if (await generate_alias('kuchumovn012345678901234567890@gmail.com', async alias => alias === 'kuchumovn01234567890123456789⬠⬡⬦') !== 'kuchumovn01234567890123456789⬠⬡⬦')
	{
		throw new Error('Self-test failed')
	}

	if (await generate_alias('kuchumovn@gmail.com', async (alias) =>
	{
		if (alias.length === 12)
		{
			return true
		}
	})
	!== 'kuchumovn⬠⬠⬠')
	{
		throw new Error('Self-test failed')
	}

	console.log('Generate unique alias tests passed')
}

// Causes weird syntax errors for some weird reason
// generate_alias_test().catch(error => console.error(error))