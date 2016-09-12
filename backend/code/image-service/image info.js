import moment from 'moment'

// import { identify, read_exif } from './image manipulation gm'
import { identify } from './image manipulation sharp'
import read_exif from './exif'
import local_date from './local date'

// when using this module do `npm install geolib simplesets timezone --save`,
// or install it from npm `npm install tzwhere --save` if it's fixed.
// import tzwhere from './tzwhere'

// Promise.promisifyAll(tzwhere)

// takes more than 30 seconds - too long for now (maybe later)
// tzwhere.init()

export default async function get_image_info(from, options = {})
{
	const { simple } = options

	const image_info = await identify(from)

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

	if (info.format !== 'jpeg')
	{
		return info
	}

	const exif = await read_exif(from)

	// UTC time in EXIF < 2.2
	// UTC time and date in EXIF >= 2.2
	if (exif.GPSTimeStamp)
	{
		// e.g. "21/1, 53/1, 5611/100"
		// GPS Time Stamp should take priority
		// over GPS Date Time Original and GPS Date Time Digitized
	}

	if (exif.DateTimeOriginal || exif.DateTimeDigitized)
	{
		info.date_utc0 = parse_gps_date(exif.DateTimeOriginal || exif.DateTimeDigitized)
	}

	if (exif.GPSLatitude && exif.GPSLongitude)
	{
		info.location =
		{
			latitude  : parse_gps_coordinate(exif.GPSLatitude),
			longitude : parse_gps_coordinate(exif.GPSLongitude)
		}

		if (exif.GPSLatitudeRef === 'S')
		{
			info.location.latitude *= -1
		}

		if (exif.GPSLongitudeRef === 'W')
		{
			info.location.longitude *= -1
		}

		// `info.date_utc0` holds photo capture date and time in UTC.
		// `info.date` will hold date and time
		// local to the area where the photo was taken.
		try
		{
			const local_time = await local_date(info.date_utc0, info.location)

			if (local_time)
			{
				info.date = local_time
			}
		}
		catch (error)
		{
			// Ignore errors
			log.error(error)
		}

		// // http://stackoverflow.com/questions/16086962/how-to-get-a-time-zone-from-a-location-using-latitude-and-longitude-coordinates
		// 	info.location.place = await tzwhere.tzNameAtAsync(location.latitude, location.longitude)
		// 	info.location.timezone = await tzwhere.tzOffsetAtAsync(location.latitude, location.longitude)
	}

	return info
}

// e.g. value = "38/1, 1535/100, 0/1"
//
// According to http://en.wikipedia.org/wiki/Geotagging,
// ( [0] => 46/1 [1] => 5403/100 [2] => 0/1 ) should mean
// 46/1 degrees, 5403/100 minutes, 0/1 seconds, i.e. 46°54.03′0″N.
// Normalizing the seconds gives 46°54′1.8″N.
//
function parse_gps_coordinate(value)
{
	if (typeof value === 'string')
	{
		value = value.split(', ')
			.map(x => x.split('/').map(x => parseInt(x)))
			.map(xy => xy[0] / xy[1])
	}

	const [hours, minutes, seconds] = value

	return hours + minutes / 60 + seconds / (60 * 60)
}

// e.g. value = "2005:07:09 14:05:15"
function parse_gps_date(value)
{
	return moment.utc(value, "YYYY:MM:DD HH:mm:ss").toDate()
}
