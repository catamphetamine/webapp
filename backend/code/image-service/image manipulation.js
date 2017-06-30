import sharp from 'sharp'

import fs from 'fs'
import promise_pipe from 'promisepipe'

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

	const streaming = typeof from !== 'string'

	let pipeline

	if (streaming)
	{
		pipeline = from.clone()
	}
	else
	{
		pipeline = image_stream(from)
	}

	if (settings.width || settings.height)
	{
		pipeline = pipeline
			// Don't enlarge small images
			.withoutEnlargement()
			// Resize the image, cropping it with gravity to (center, center)
			.resize(settings.width, settings.height)

		if (settings.max_width && settings.max_height && !settings.square)
		{
			pipeline = pipeline.max()
		}
	}

	if (settings.format)
	{
		pipeline = pipeline.toFormat(settings.format)
	}

	if (streaming)
	{
		let info

		pipeline.on('info', image_info => info = image_info)

		return promise_pipe(pipeline, fs.createWriteStream(to)).then(() => info)
	}

	return pipeline.toFile(to)
}

// Rotates the image based on `exif:Orientation`
export function autorotate(from, to)
{
	return resize(from, to, {})
}

export function image_stream(from)
{
	return sharp(from)
		// Automatically orient the image based on EXIF Orientation info
		.rotate()
		// preserve EXIF metadata + add sRGB ICC profile
		.withMetadata()
}