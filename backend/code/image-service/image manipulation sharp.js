// https://github.com/59naga/babel-plugin-transform-bluebird/pull/2
import Promise from 'bluebird'

import fs from 'fs'
import sharp from 'sharp'

import ExifReader from './ExifReader'
import DataView from './DataView'

// image resize
//
// settings:
// {
// 	// fit image into a "max_width x max_height" square,
// 	max_width: ...,
// 	max_height: ...,
//
// 	// resize image into the exact size (width takes priority)
// 	width,
// 	height,
// 	crop: true/false
// }
//
export function resize(from, to, settings)
{
	// will be mutated
	settings = Object.clone(settings)

	if (settings.max_extent)
	{
		settings.max_width  = settings.max_extent
		settings.max_height = settings.max_extent
	}

	if (settings.max_width)
	{
		settings.width = settings.max_width
		// height is `undefined` and hence assumed "auto"
	}

	if (settings.max_height)
	{
		settings.height = settings.max_height
		// width is `undefined` and hence assumed "auto"
	}

	// resize into a "square x square" square
	// (width = square, height = square, cropped)
	if (settings.square)
	{
		settings.width  = settings.max_extent
		settings.height = settings.max_extent
	}

	// Resize the image

	let pipeline = sharp(from)
		// Automatically orient the image based on EXIF Orientation info
		.rotate()
		// preserve EXIF metadata + add sRGB ICC profile
		.withMetadata()
		// Resize the image, cropping it with gravity to (center, center)
		.resize(settings.width, settings.height)
		// Don't enlarge small images
		.withoutEnlargement()

	if (!settings.square && (settings.max_width && settings.max_height))
	{
		pipeline = pipeline.max()
	}

	if (settings.format)
	{
		console.log('@@@@@@@@@@@@ settings.format', settings.format)
		console.log('jpeg, png, webp or raw')
		pipeline = pipeline.toFormat(settings.format)
	}

	return pipeline.toFile(to)
}

// Rotates the image based on `exif:Orientation`
export function autorotate(from, to)
{
	return sharp(from).rotate().toFile(to)
}

// returns:
//
// {
// 	width,       // 1000
// 	height,      // 1000
// 	format,      // 'jpeg', 'png', ...
// 	'mime type', // 'image/jpeg'
// 	...
// }
//
export function identify(path)
{
	return sharp(path).metadata()
}

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
export async function read_exif(path)
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

	// Parse the Exif tags using a simple DataView polyfill.
	Exif.loadView(new DataView(buffer))

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