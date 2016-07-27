// "Poor man's" ACL.
// Just playing around.

import ip from 'ip'

function is_empty(list)
{
	return list.is_empty()
}

export default class Access_list
{
	allowed_subnets = []
	blocked_subnets = []

	constructor(access_list = [])
	{
		for (let statement of access_list)
		{
			// Just in case
			statement = statement.trim()

			// Exclusion pattern
			if (statement[0] === '!')
			{
				const subnet = statement.substring(1)

				if (!is_valid_ipv4_cidr_subnet(subnet))
				{
					throw new Error(`Invalid IPv4 CIDR subnet "${subnet}"`)
				}

				this.blocked_subnets.push(ip.cidrSubnet(subnet))
			}
			// Inclusion pattern
			else
			{
				const subnet = statement

				if (!is_valid_ipv4_cidr_subnet(subnet))
				{
					throw new Error(`Invalid IPv4 CIDR subnet "${subnet}"`)
				}

				this.allowed_subnets.push(ip.cidrSubnet(subnet))
			}
		}
	}

	test(ip)
	{
		if (is_empty(this.allowed_subnets) && is_empty(this.blocked_subnets))
		{
			return true
		}

		for (let subnet of this.blocked_subnets)
		{
			if (subnet.contains(ip))
			{
				return false
			}
		}

		for (let subnet of this.allowed_subnets)
		{
			if (subnet.contains(ip))
			{
				return true
			}
		}

		return false
	}
}

// http://blog.markhatton.co.uk/2011/03/15/regular-expressions-for-ip-addresses-cidr-ranges-and-hostnames/
const ipv4_cidr_subnet_regexp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/

function is_valid_ipv4_cidr_subnet(subnet)
{
	return ipv4_cidr_subnet_regexp.test(subnet)
}