export default class IP_limiter
{
	ips = {}

	constructor(max_per_second)
	{
		this.interval = 1000 // a second
		this.max_per_second = max_per_second
	}

	passes(ip)
	{
		const ip_stats = this.ips[ip]

		const now = Date.now()

		if (!ip_stats)
		{
			if (this.max_per_second === 0)
			{
				return false
			}

			this.ips[ip] = [now]
			return true
		}

		while (ip_stats.length > 0 && now - this.interval > ip_stats[0])
		{
			ip_stats.shift()
		}

		if (ip_stats.length >= this.max_per_second)
		{
			return false
		}

		ip_stats.push(now)
		return true
	}
}