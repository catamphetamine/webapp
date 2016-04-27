export default function generate(messages, countries)
{
	const all = {}

	for (let key of Object.keys(messages))
	{
		all[key] = messages[key]
	}

	for (let key of Object.keys(countries))
	{
		all[`country.${key}`] = countries[key]
	}

	return all
}