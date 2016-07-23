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

					resolve(new Date(utc_date.getTime() + data.rawOffset * 1000 + data.dstOffset * 1000))
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