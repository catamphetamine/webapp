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
export default function resize(from, to, settings)
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
		settings.width  = settings.square
		settings.height = settings.square
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
	
	// gravitate to center (must precede the -extent setting)
	parameters.customArgs.push('-gravity')
	parameters.customArgs.push('center')
	
	parameters.width = settings.width

	if (settings.crop)
	{
		parameters.height = settings.height + '^'
	}
	else
	{
		parameters.height = settings.height + '>'
	}

	// if an image doesn't cover the specified rectangle,
	// then add white padding
	if (settings.fill || settings.crop)
	{
		parameters.customArgs.push('-extent')
		parameters.customArgs.push(settings.width + 'x' + settings.height)
	}

	// automatically orient the image based on EXIF Orientation info
	parameters.customArgs.push('-auto-orient')

	// console.log('converting image', parameters)
	
	// resize the image
	return imagemagick.resizeAsync(parameters) // (error, output, errors_output) => {}
}