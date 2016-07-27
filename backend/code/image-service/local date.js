import https from 'https'
import querystring from 'querystring'

// Gets local time by UTC time and GPS coordinates (uses Google Time Zone API)
// https://developers.google.com/maps/documentation/timezone/intro
export default function get_local_date(utc_date, coordinates)
{
	if (!configuration.geocoding.timezone_by_coordinates)
	{
		return Promise.resolve()
	}

	if (configuration.geocoding.timezone_by_coordinates.provider !== 'google')
	{
		return Promise.reject(`Only "google" provider is supported. Got "${configuration.geocoding.timezone_by_coordinates.provider}"`)
	}

	const options =
	{
		location  : `${coordinates.latitude},${coordinates.longitude}`,
		timestamp : utc_date.getTime() / 1000,
		key       : configuration.geocoding.timezone_by_coordinates.key
	}

	return new Promise((resolve, reject) =>
	{
		let response_body = ''

		https.get
		({
			hostname : 'maps.googleapis.com',
			port     : 443,
			path     : '/maps/api/timezone/json?' + querystring.stringify(options)
		},
		function(response)
		{
			response.on('data', function(chunk)
			{
				response_body += chunk
			})
			.on('error', reject)
			.on('end', function()
			{
				try
				{
					const data = JSON.parse(response_body)

					if (data.status !== 'OK')
					{
						return reject(data.errorMessage || data.status)
					}

					const local_time = new Date(utc_date.getTime() + data.dstOffset * 1000 + data.rawOffset * 1000)
					const ISO_8601 = local_time.toISOString()

					if (!ISO_8601.ends_with('Z'))
					{
						throw new Error(`Couldn't inject timezone into ISO 8601 Date string "${ISO_8601}": doesn't end with a "Z"`)
					}
				
					let offset_minutes = data.rawOffset / 60
					const offset_hours = Math.floor(offset_minutes / 60)
					offset_minutes = offset_minutes % 60

					const sign = data.rawOffset > 0 ? '+' : '-'

					const local_date = ISO_8601.substring(0, ISO_8601.length - 1) + sign + two_digits(offset_hours) + two_digits(offset_minutes)

					resolve(local_date)
				}
				catch (error)
				{
					reject(error)
				}
			})
		})
		.on('error', reject)
	})
}

function two_digits(integer)
{
	integer = Math.floor(integer)
	if (integer < 0 || integer > 99)
	{
		throw new Error(`Non two-digit integer supplied: ${integer}`)
	}
	return integer > 9 ? `${integer}` : `0${integer}`
}