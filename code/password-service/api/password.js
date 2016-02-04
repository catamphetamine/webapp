// http://stackoverflow.com/questions/1561174/sha512-vs-blowfish-and-bcrypt
//
// "Speed is exactly what you don’t want in a password hash function."

import bcrypt from 'bcrypt'

Promise.promisifyAll(bcrypt)

function check_password(password, hashed_password)
{
	return bcrypt.compareAsync(password, hashed_password)
}

async function hash_password(password)
{
	const salt = await bcrypt.genSaltAsync(10)
	return await bcrypt.hashAsync(password, salt)
}

api.get('/hash', async function({ password })
{
	return { hash: await hash_password(password) }
})

api.get('/check', async function({ password, hashed_password })
{
	return await check_password(password, hashed_password)
})