// https://github.com/59naga/babel-plugin-transform-bluebird/pull/2
import Promise from 'bluebird'

import gm from 'gm'

const imagemagick = gm.subClass({ imageMagick: true })

// imagemagick resize
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

	if (settings.width && settings.height)
	{
		settings.fill = true
	}

	if (settings.max_width)
	{
		settings.width = settings.max_width
	}

	if (settings.max_height)
	{
		settings.height = settings.max_height
	}

	if (settings.max_extent)
	{
		settings.width  = settings.max_extent
		settings.height = settings.max_extent
	}

	// resize into a "square x square" square
	// (width = square, height = square, cropped)
	if (settings.square)
	{
		if (typeof settings.square === 'number')
		{
			settings.width  = settings.square
			settings.height = settings.square
		}
		
		settings.crop = true
	}

	// `imagemagick` parameters
	const parameters = 
	{
		quality : 0.85,
		filter  : 'Lagrange'
	}

	if (settings.format)
	{
		parameters.format = settings.format
	}

	parameters.width = settings.width

	if (settings.crop)
	{
		// Append a ^ to the geometry so that the image is resized
		// while maintaining the aspect ratio of the image, but
		// the resulting width or height are treated as minimum values
		// rather than maximum values.
		parameters.resize_options = '^'
		parameters.crop =
		{
			width  : settings.width,
			height : settings.height
		}
	}
	else
	{
		// Use > to change the dimensions of the image only if 
		// its width or height exceeds the geometry specification.
		// < resizes the image only if both of its dimensions are
		// less thanthe geometry specification. For example, 
		// if you specify '640x480>' and the image size is 256x256,
		// the image size does not change. However, if the image
		// is 512x512 or 1024x1024, it is resized to 480x480.
		// Enclose the geometry specification in quotation marks
		// to prevent the < or > from being interpreted by your shell as a file redirection.
		parameters.resize_options = '>'
	}

	if (settings.fill || settings.crop)
	{
		// gravitate to center (must precede the -extent setting)
		parameters.gravity = 'Center'

		// if an image doesn't cover the specified rectangle,
		// then add white padding
		parameters.extent =
		{
			width  : settings.width,
			height : settings.height
		}
	}

	// console.log('converting image', parameters)
	
	// resize the image

	// automatically orient the image based on EXIF Orientation info
	let pipeline = imagemagick(from).autoOrient()

	if (parameters.format)
	{
		pipeline = pipeline.setFormat(parameters.format)
	}

	if (parameters.quality)
	{
		pipeline = pipeline.quality(parameters.quality)
	}

	if (parameters.filter)
	{
		pipeline = pipeline.filter(parameters.filter)
	}

	pipeline = pipeline.resize(parameters.width, parameters.height, parameters.resize_options)

	if (parameters.gravity)
	{
		pipeline = pipeline.gravity(parameters.gravity)
	}

	if (parameters.extent)
	{
		pipeline = pipeline.extent(parameters.extent.width, parameters.extent.height)
		// .fill(color) // rgba(r,g,b,a), #RRGGBBAA
	}

	if (parameters.crop)
	{
		pipeline = pipeline.crop(parameters.crop.width, parameters.crop.height)
	}

	return Promise.promisify(pipeline.write, pipeline)(to)
}

// Rotates the image based on `exif:Orientation`
export function autorotate(from, to)
{
	const image = imagemagick(from).autoOrient()
	return Promise.promisify(image.write, image)(to)
}

// returns:
//
// {
// 	width,       // 1000
// 	height,      // 1000
// 	format,      // 'JPEG', 'PNG', 
// 	'mime type', // 'image/jpeg'
// 	...
// }
//
export function identify(path)
{
	const image = imagemagick(path)
	return Promise.promisify(image.identify, image)()
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
	const image = imagemagick(path)

	const exif = await Promise.promisify(image.identify, image)('%[EXIF:*]')

	return exif
		.split('\n')
		.map(line => line.trim().split('='))
		.reduce((exif, key_value) =>
		{
			exif[key_value[0].replace(/^exif:/, '')] = key_value[1]
			return exif
		},
		{})
}