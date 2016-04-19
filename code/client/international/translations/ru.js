import countries from './countries/ru'
import messages  from './messages/ru'

const all = {}

for (let key of Object.keys(messages))
{
	all[key] = messages[key]
}

for (let key of Object.keys(countries))
{
	all[`country.${key}`] = countries[key]
}

export default all