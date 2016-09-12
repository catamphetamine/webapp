// https://github.com/59naga/babel-plugin-transform-bluebird/pull/2
import Promise from 'bluebird'

import sharp from 'sharp'

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
