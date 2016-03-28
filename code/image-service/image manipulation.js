import imagemagick from 'imagemagick'
// import imagemagick from 'imagemagick-native'

Promise.promisifyAll(imagemagick)

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
		srcPath : from,
		dstPath : to,
		quality : 0.85,
		strip   : false,
		filter  : 'Lagrange'
	}

	if (settings.format)
	{
		parameters.format = settings.format
	}

	// fs.writeFileSync(to, imagemagick.convert
	// ({
	// 	srcData     : fs.readFileSync(from),
	// 	width       : 100,
	// 	height      : 100,
	// 	resizeStyle : 'aspectfill', // is the default, or 'aspectfit' or 'fill'
	// 	gravity     : 'Center' // optional: position crop area when using 'aspectfill'
	// }))

	// fs.createReadStream('input.png').pipe(imagemagick.streams.convert
	// ({
	// 	// options
	// }))
	// .pipe(fs.createWriteStream('output.png'))

	parameters.customArgs = []
	
	parameters.width = settings.width

	if (settings.crop)
	{
		parameters.height = settings.height + '^'
	}
	else
	{
		parameters.height = settings.height + '>'
	}

	if (settings.fill || settings.crop)
	{
		// gravitate to center (must precede the -extent setting)
		parameters.customArgs.push('-gravity')
		parameters.customArgs.push('center')

		// if an image doesn't cover the specified rectangle,
		// then add white padding
		parameters.customArgs.push('-extent')
		parameters.customArgs.push(settings.width + 'x' + settings.height)
	}

	// automatically orient the image based on EXIF Orientation info
	parameters.customArgs.push('-auto-orient')

	// console.log('converting image', parameters)
	
	// resize the image
	return imagemagick.resizeAsync(parameters) // (error, output, errors_output) => {}
}

// Rotates the image based on `exif:Orientation`
export function autorotate(from, to)
{
	return imagemagick.convertAsync(['-auto-orient', from, to || from])
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
	return imagemagick.identifyAsync(path)
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
	const exif = await imagemagick.identifyAsync(['-format', '%[EXIF:*]', path])

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