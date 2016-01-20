// This is an example of a simple REST Api implementation.
//
// For debugging you can use "Advanced REST Client" for Google Chrome:
// https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo

const users = new Map()
let id_counter = 0

function find_user_by_id(id)
{
	return users.get(id)
}

function find_user_by_email(email)
{
	for (let [user_id, user] of users)
	{
		if (user.email === email)
		{
			return user
		}
	}
}

api.post('/sign_in', function({ email, password })
{
	const user = find_user_by_email(email)

	if (!user)
	{
		throw new Errors.Not_found(`User with email ${email} not found`)
	}

	if (user.password !== password)
	{
		throw new Error(`Wrong password`) 
	}

	return { id: user.id, name: user.name }
})

api.post('/register', function({ name, email, password })
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

	if (find_user_by_email(email))
	{
		throw new Error(`User with email ${email} already exists`)
	}

	id_counter++
	const id = String(id_counter)

	users.set(id, { name, email, password })

	return { id }
})