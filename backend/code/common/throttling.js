// By default it gives a user 4 tries
// with the fifth try after 20 minutes cooldown
// and then the cooldown increases for each failed attempt.
export default class Throttling
{
	// Temperature cooling coefficient
	k = 0.0001

	// Max "temperature"
	hottest_allowed_temperature = 10

	constructor(store, options = {})
	{
		const { overheat } = options

		// Reads and writes latest attempt date and temperature
		this.store = store

		if (overheat)
		{
			this.hottest_allowed_temperature = overheat
		}
	}

	// Each failed login attempt increases the `temperature` twice.
	// Once the temperature reaches the maximum threshold
	// all further login attempts will be denied.
	// The temperature cools down to a half of its value every 15 minutes.
	async attempt(info, check)
	{
		let temperature = 0

		// If no login attempts failed so far
		// then allow the next login attempt.
		if (info.latest_attempt)
		{
			// Fast forward temperature cooldown
			// since the latest failed login attempt till now.
			temperature = this.fast_forward_temperature_cooldown(info)

			// If the temperature is still too hot
			// then deny login attempts
			//
			// (if too many login attempts have been made
			//  for this user recently, then impose a short cooldown period)
			//
			if (temperature > this.hottest_allowed_temperature)
			{
				const result =
				{
					throttled : true,
					cooldown  : this.cooldown_estimate(info)
				}

				return result
			}
		}

		const result =
		{
			throttled : false
		}

		// Absence of `check` may be used
		// to just limit function call frequency
		if (!check)
		{
			// Increase attempts counter and the temperature
			await this.failed(info, temperature)
			return result
		}

		// Check if the password matches
		const passed = await check()

		if (passed)
		{
			// Reset threshold for login attempt count limiter
			await this.succeeded(info)
			result.result = passed || true
		}
		else
		{
			// Increase attempts counter and the temperature
			await this.failed(info, temperature)
			result.result = false
		}

		return result
	}

	async succeeded(info)
	{
		await this.store.succeeded(info.id)
	}

	async failed(info, temperature)
	{
		if (temperature < 1)
		{
			temperature = 1
		}

		temperature *= 2

		// Register this failed attempt
		await this.store.failed(info.id, info.attempts + 1, temperature)
	}

	// Fast forwards temperature cooldown
	// since the latest failed login attempt till now.
	fast_forward_temperature_cooldown(info)
	{
		const time_passed = Date.now() - info.latest_attempt.getTime()

		// http://formulas.tutorvista.com/physics/newton-s-law-of-cooling-formula.html
		//
		// The temperature is gonna be:
		//
		// * 2 (after first failed attempt)
		// * 4 (after second attempt)
		// * 8 (after third attempt)
		// * 16 (after fourth attempt)
		// * Now over the 10 threshold, so it will cool down for 20 minutes
		// * Now again over the threshold, this time it will cool down for an hour
		// * Again over the threshold, this time it will cool down for 2 hours
		// * Again over the threshold, this time it will cool down for 5 hours
		// * Again over the threshold, this time it will cool down for 8 hours
		// * Again over the threshold, this time it will cool down for 12 hours
		// * Again over the threshold, this time it will cool down for 20 hours
		// * Again over the threshold, this time it will cool down for a day
		// * Again over the threshold, this time it will cool down for a day and a half
		// * Again over the threshold, this time it will cool down for 2 days
		// * Again over the threshold, this time it will cool down for 3 days
		// * Again over the threshold, this time it will cool down for 4 days
		// * ...
		//
		return info.temperature * Math.exp(-1 * this.k * (1 / Math.pow(info.attempts, 4)) * time_passed)
	}

	// How much cooldown left until the next attempt can be made
	cooldown_estimate(info)
	{
		// Sanity check
		if (info.temperature <= this.hottest_allowed_temperature)
		{
			return 0
		}

		// Sanity check
		if (!info.latest_attempt)
		{
			return 0
		}

		const cooldown_since_latest_attempt = Math.floor(Math.log(this.hottest_allowed_temperature / info.temperature) / (-1 * this.k * (1 / Math.pow(info.attempts, 4))))
		const time_passed_since_latest_attempt = Date.now() - info.latest_attempt.getTime()

		return cooldown_since_latest_attempt - time_passed_since_latest_attempt
	}
}