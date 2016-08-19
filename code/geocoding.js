import geocoder from 'node-geocoder'

let address_geocoder
let reverse_geocoder
let reverse_ip_geocoder

// See this issue for Russian language support
// https://github.com/nchaulet/node-geocoder/issues/186

// For client side support see this issue
// https://github.com/nchaulet/node-geocoder/issues/187

if (configuration.geocoding)
{
	if (configuration.geocoding.address)
	{
		address_geocoder = geocoder
		({
			provider : configuration.geocoding.address.provider,
			apiKey   : configuration.geocoding.address.key
		})
	}

	if (configuration.geocoding.reverse)
	{
		reverse_geocoder = geocoder
		({
			provider : configuration.geocoding.reverse.provider,
			apiKey   : configuration.geocoding.reverse.key,
			language : 'ru-UA'
		})
	}

	if (configuration.geocoding.reverse_ip)
	{
		reverse_ip_geocoder = geocoder
		({
			provider : configuration.geocoding.reverse_ip.provider,
			apiKey   : configuration.geocoding.reverse_ip.key
		})
	}
}

export function can_lookup_ip()
{
	return reverse_ip_geocoder !== undefined
}

// Response:
//
// { ip: '93.80.231.194',
//   countryCode: 'RU',
//   country: 'Russia',
//   regionCode: 'MOW',
//   regionName: 'Moscow',
//   city: 'Moscow',
//   zipcode: '115998',
//   timeZone: 'Europe/Moscow',
//   latitude: 55.752,
//   longitude: 37.615,
//   metroCode: 0,
//   provider: 'freegeoip' }
//
export function lookup_ip(ip)
{
	if (!reverse_ip_geocoder)
	{
		throw new Error(`Reverse IP geocoder not set up in configuration`)
	}

	return reverse_ip_geocoder.geocode(ip).then(results =>
	{
		const result = results[0]

		const fields =
		[
			'countryCode',
			'country',
			'regionCode',
			'regionName',
			'city',
			'latitude',
			'longitude'
		]

		const reduced_result = {}

		for (let field of fields)
		{
			reduced_result[field] = result[field]
		}

		return reduced_result
	})
}

export function can_lookup_coordinates()
{
	return reverse_geocoder !== undefined
}

// Response:
//
// { formattedAddress: 'Дворцовая ул., Москва, Россия, 125009',
//   latitude: 55.7513781,
//   longitude: 37.614722,
//   extra: 
//    { googlePlaceId: 'ChIJgc6zOVFKtUYRIHPLJrmxjxs',
//      confidence: 0.7,
//      premise: null,
//      subpremise: null,
//      neighborhood: 'Тверской район',
//      establishment: null },
//   administrativeLevels: 
//    { level2long: 'город Москва',
//      level2short: 'г. Москва',
//      level1long: 'город Москва',
//      level1short: 'г. Москва' },
//   streetName: 'Дворцовая улица',
//   city: 'Москва',
//   country: 'Россия',
//   countryCode: 'RU',
//   zipcode: '125009',
//   provider: 'google' }
//
export function lookup_coordinates(coordinates, locale)
{
	if (!reverse_geocoder)
	{
		throw new Error(`Reverse geocoder not set up in configuration`)
	}

	return reverse_geocoder.reverse({ lat: coordinates.latitude, lon: coordinates.longitude, language: locale }).then(results => results[0])
}

export function can_lookup_address()
{
	return address_geocoder !== undefined
}

export function lookup_address(address)
{
	if (!address_geocoder)
	{
		throw new Error(`Address geocoder not set up in configuration`)
	}
	
	return address_geocoder.geocode(address)
}