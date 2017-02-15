import { http, errors } from 'web-service'

// No login attempts will be allowed
// past this temperature threshold
// (this is for password bruteforce protection)
const The_hottest_allowed_temperature = 1000

// How fast does temperature cool down
const Temperature_half_life = 15 * 60 // in seconds

// If two consecutive failed attempts
// were attempted within `Penalty_interval`
// then penalty (temperature raise) will be imposed.
const Penalty_interval = 15 * 60 // in seconds

export default class Throttling
{
	constructor(store, error_message)
	{
		this.store = store
		this.error_message = error_message
	}

	// Each failed login attempt increases the `temperature` twice.
	// Once the temperature reaches the maximum threshold
	// all further login attempts will be denied.
	// The temperature cools down to a half of its value every 15 minutes.
	async attempt(info, check)
	{
		let temperature

		// If no login attempts failed so far
		// then allow the next login attempt.
		if (info.latest_attempt)
		{
			// Fast forward temperature cooldown
			// since the latest failed login attempt till now.
			temperature = fast_forward_cool_down_temperature(info)

			// If the temperature is still too hot
			// then deny login attempts
			//
			// (if too many login attempts have been made
			//  for this user recently, then impose a short cooldown period)
			//
			if (temperature > The_hottest_allowed_temperature)
			{
				throw new errors.Access_denied(this.error_message)
			}
		}

		// Absence of `check` may be used
		// to limit function call count
		if (!check)
		{
			await this.failed(info, temperature)
			return
		}

		// Check if the password matches
		const passed = await check()

		// If the password is wrong, return an error
		if (!passed)
		{
			await this.failed(info, temperature)
			return false
		}

		// Reset threshold for login attempt count limiter
		const result = await this.succeeded(info)
		return passed || true
	}

	async succeeded(info)
	{
		await this.store.succeeded(info.id)
	}

	async failed(info, temperature)
	{
		if (temperature)
		{
			const when = info.latest_attempt.getTime()

			// If the two consecutive failed login attempts weren't close enough to each other
			// then don't penalize for attempt failure and don't double the temperature.
			if (Date.now() > when + Penalty_interval * 1000)
			{
				// no penalty
			}
			// Otherwise impose penalty
			else
			{
				// Double the temperature
				temperature *= 2
			}
		}
		else
		{
			// The initial temperature is 2
			// for the first failed attempt
			temperature = 2
		}

		// Register this failed login attempt
		await this.store.failed(info.id, temperature)
	}
}

// Fast forwards temperature cooldown
// since the latest failed login attempt till now.
function fast_forward_cool_down_temperature(info)
{
	let temperature = info.temperature
	let when        = info.latest_attempt.getTime()
	const now       = Date.now()

	while (now >= when + Temperature_half_life * 1000)
	{
		// Cool down the temperature to a half of its value
		temperature /= 2
		when += Temperature_half_life * 1000

		// Consider all temperatures below 1 to equal 0
		// because it doesn't really matter and saves CPU cycles
		if (temperature < 1)
		{
			temperature = 0
			break
		}
	}

	return temperature
}