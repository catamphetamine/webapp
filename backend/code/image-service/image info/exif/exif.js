import fs from 'fs'

import ExifReader from './ExifReader'
import DataView from './DataView'

// returns:
//
// {
// 	DateTimeOriginal, // "2005:07:09 14:05:15"
// 	GPSLatitude,      // "38/1, 1535/100, 0/1"
// 	GPSLatitudeRef,   // "N"
// 	GPSTimeStamp,
// 	...
// }
//
export default async function read_exif(path)
{
	// const buffer = (await sharp(path).metadata()).exif

	const buffer = await new Promise((resolve, reject) =>
	{
		fs.open(path, 'r', function(status, descriptor)
		{
			if (status)
			{
				return reject(status.message)
			}

			// We only need the start of the file for the Exif info.
			const buffer = new Buffer(128 * 1024)
			fs.read(descriptor, buffer, 0, 128 * 1024, 0, function(error)
			{
				if (error)
				{
					return reject(error)
				}

				resolve(buffer)

				fs.close(descriptor)
			})
		})
	})

	const Exif = new ExifReader.ExifReader()

	try
	{
		// Parse the Exif tags using a simple DataView polyfill.
		Exif.loadView(new DataView(buffer))
	}
	catch (error)
	{
		if (error.message === 'No Exif data'
			|| error.message === 'Invalid image format'
			|| error.message === 'Illegal byte order value. Faulty image.')
		{
			return {}
		}

		throw error
	}

	// The MakerNote tag can be really large. Remove it to lower memory usage.
	Exif.deleteTag('MakerNote')

	const exif = Exif.getAllTags()

	if (!exif)
	{
		return {}
	}

	const result = {}

	for (let key of Object.keys(exif))
	{
		result[key] = exif[key].value
	}

	return result

	// return exif
	// 	.split('\n')
	// 	.map(line => line.trim().split('='))
	// 	.reduce((exif, key_value) =>
	// 	{
	// 		exif[key_value[0].replace(/^exif:/, '')] = key_value[1]
	// 		return exif
	// 	},
	// 	{})
}