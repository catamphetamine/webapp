// By default it gives a user 4 tries
// with the fifth try after 20 minutes cooldown
// and then the cooldown increases for each failed attempt.
export default class Throttling
{
	// Temperature cooling coefficient
	k = 0.001

	// Max "temperature"
	hottest_allowed_temperature = 5

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
	async attempt(info, check, options = {})
	{
		let temperature = 0

		// If no login attempts failed so far
		// then allow the next login attempt.
		if (info.latest_attempt)
		{
			// Fast forward temperature cooldown
			// since the latest failed login attempt till now.
			// The fast-forwarded `temperature` is used later in code.
			temperature = this.fast_forward_temperature_cooldown(info)

			// Temperature to be checked against the threshold
			let check_temperature = temperature

			// If `options.count` is set then checks if there's
			// enough room for `options.count` consecutive "attempts".
			if (options.count)
			{
				let count = options.count
				while (count > 1)
				{
					check_temperature = this.penalize_temperature(check_temperature)
					count--
				}
			}

			// If the temperature is still too hot
			// (or is gonna be be too hot)
			// then deny login attempts
			//
			// (if too many login attempts have been made
			//  for this user recently, then impose a short cooldown period)
			//
			if (check_temperature > this.hottest_allowed_temperature)
			{
				const result =
				{
					throttled : true,
					cooldown  : this.cooldown_estimate
					({
						temperature    : check_temperature,
						latest_attempt : new Date(),
						attempts       : info.attempts
					})
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
		// Register this failed attempt
		await this.store.failed(info.id, info.attempts + 1, this.penalize_temperature(temperature))
	}

	penalize_temperature(temperature)
	{
		temperature *= 2

		if (temperature < 1)
		{
			temperature = 1
		}

		return temperature
	}

	// Fast forwards temperature cooldown
	// since the latest failed login attempt till now.
	fast_forward_temperature_cooldown({ temperature, attempts, latest_attempt })
	{
		const time_passed = Date.now() - latest_attempt.getTime()

		// http://formulas.tutorvista.com/physics/newton-s-law-of-cooling-formula.html
		//
		// The temperature is gonna be:
		//
		// * 0
		// * 1
		// * 2
		// * 4
		// * 8. Now over the 5 threshold, so it will cool down for 2 minutes
		// * Again over the threshold, this time it will cool down for 7 minutes
		// * Again over the threshold, this time it will cool down for 15 minutes
		// * Again over the threshold, this time it will cool down for 30 minutes
		// * Again over the threshold, this time it will cool down for 45 minutes
		// * Again over the threshold, this time it will cool down for 1 hour
		// * Again over the threshold, this time it will cool down for 2 hours
		// * Again over the threshold, this time it will cool down for 3 hours
		// * Again over the threshold, this time it will cool down for 4 hours
		// * Again over the threshold, this time it will cool down for 6 hours
		// * Again over the threshold, this time it will cool down for 8 hours
		// * Again over the threshold, this time it will cool down for 10 hours
		// * Again over the threshold, this time it will cool down for 13 hours
		// * Again over the threshold, this time it will cool down for 16 hours
		// * Again over the threshold, this time it will cool down for 20 hours
		// * Again over the threshold, this time it will cool down for a day
		// * ...
		//
		return temperature * Math.exp(-this.k * time_passed / Math.pow(attempts, 4))
	}

	// How much cooldown left until the next attempt can be made
	cooldown_estimate({ temperature, attempts, latest_attempt })
	{
		// Sanity check
		if (!temperature || temperature <= this.hottest_allowed_temperature)
		{
			return 0
		}

		const cooldown_since_latest_attempt = Math.floor(Math.log(this.hottest_allowed_temperature / temperature) * Math.pow(attempts, 4) / -this.k)
		const time_passed_since_latest_attempt = Date.now() - latest_attempt.getTime()

		return cooldown_since_latest_attempt - time_passed_since_latest_attempt
	}
}