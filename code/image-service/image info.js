import moment      from 'moment'
import imagemagick from 'imagemagick'

// when using this module do `npm install geolib simplesets timezone --save`,
// or install it from npm `npm install tzwhere --save` if it's fixed.
// import tzwhere from './tzwhere'

Promise.promisifyAll(imagemagick)
// Promise.promisifyAll(tzwhere)

// takes more than 30 seconds - too long for now (maybe later)
// tzwhere.init()

export default async function get_image_info(from, options = {})
{
	const { simple } = options

	const image_info = await imagemagick.identifyAsync(from)

	// image_info.width
	// image_info.height
	// image_info.format // 'JPEG', 'PNG', 
	// image_info['mime type'] // 'image/jpeg'

	const info = 
	{
		width  : image_info.width,
		height : image_info.height,
		format : image_info.format
	}

	if (simple)
	{
		return info
	}

	let date
	let location = {}

	const exif = await imagemagick.identifyAsync(['-format', '%[EXIF:*]', from])

	exif.split('\n').forEach(line =>
	{
		const [key, value] = line.trim().split('=')

		switch (key)
		{
			case 'exif:DateTimeOriginal':
				// e.g. "2005:07:09 14:05:15"
				date = parse_gps_date(value)
				break

			case 'exif:DateTimeDigitized':
				// e.g. "2005:07:09 14:05:15"
				if (!date)
				{
					date = parse_gps_date(value)
				}
				break

			case 'exif:GPSLatitude':
				// e.g. "38/1, 1535/100, 0/1"
				location.latitude = parse_gps_coordinate(value)
				break

			case 'exif:GPSLatitudeRef':
				// e.g. "N"
				// (positive for north latitudes and negative for south)
				location.latitude_direction = value === 'N' ? 1 : -1
				break

			case 'exif:GPSLongitude':
				// e.g. "85/1, 4478/100, 0/1"
				location.longitude = parse_gps_coordinate(value)
				break

			case 'exif:GPSLongitudeRef':
				// e.g. "W"
				// (positive for east longitudes and negative for west)
				location.longitude_direction = value === 'E' ? 1 : -1
				break

			// UTC time in EXIF < 2.2
			// UTC time and date in EXIF >= 2.2
			case 'exif:GPSTimeStamp':
				// e.g. "21/1, 53/1, 5611/100"
				// GPS Time Stamp should take priority 
				// over GPS Date Time Original and GPS Date Time Digitized
				break
		}
	})

	// parse the location
	if (location.latitude && location.longitude)
	{
		location.latitude  = location.latitude  * location.latitude_direction
		location.longitude = location.longitude * location.longitude_direction

		delete location.latitude_direction
		delete location.longitude_direction

		// // http://stackoverflow.com/questions/16086962/how-to-get-a-time-zone-from-a-location-using-latitude-and-longitude-coordinates
		// 	location.place = await tzwhere.tzNameAtAsync(location.latitude, location.longitude)
		// 	location.timezone = await tzwhere.tzOffsetAtAsync(location.latitude, location.longitude)

		info.location = location
	}

	if (date)
	{
		info.date = date
	}

	return info
}

// According to http://en.wikipedia.org/wiki/Geotagging, 
// ( [0] => 46/1 [1] => 5403/100 [2] => 0/1 ) should mean 
// 46/1 degrees, 5403/100 minutes, 0/1 seconds, i.e. 46°54.03′0″N. 
// Normalizing the seconds gives 46°54′1.8″N.
function parse_gps_coordinate(value)
{
	const [hours, minutes, seconds] = value.split(', ')
		.map(x => x.split('/').map(x => parseInt(x)))
		.map(xy => xy[0] / xy[1])

	return hours + minutes / 60 + seconds / (60 * 60)
}

function parse_gps_date(value)
{
	return moment(value, "YYYY:MM:DD HH:mm:ss").toDate()
}
