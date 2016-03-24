import web_server from '../common/web server'

import imagemagick from 'imagemagick'
// import imagemagick from 'imagemagick-native'

import path from 'path'
import fs   from 'fs-extra'

Promise.promisifyAll(imagemagick)

const upload_folder = path.resolve(Root_folder, configuration.image_service.temporary_files_directory)
const output_folder = path.resolve(Root_folder, configuration.image_service.files_directory)

// если размер меньше size[0] - не ресайзить
const image_sizes = 
[
	300,
	600,
	1000,
	1500,
	2100,
	2800,
	3600,
	4500
]

const web = web_server()

// imagemagick resize
//
// settings:
// {
// 	// resize image into a "dimension x dimension" square while cropping it,
// 	dimension: ...,
//
// 	// fit image into a "max_dimension x max_dimension" square,
// 	max_dimension: ...,
//
// 	// resize image into the exact size (width takes priority)
// 	width,
// 	height,
// 	crop: true/false
// }
//
function resize(from, to, settings)
{
	// will be mutated
	settings = Object.clone(settings)

	if (settings.max_width)
	{
		settings.width = settings.max_width
	}

	if (settings.max_height)
	{
		settings.height = settings.max_height
	}

	// width <= max_dimension, height <= max_dimension
	if (settings.max_dimension)
	{
		settings.width  = settings.max_dimension
		settings.height = settings.max_dimension
		settings.crop = false
	}

	// resize into a dimension x dimension square
	// (width = dimension, height = dimension, cropped)
	if (settings.dimension)
	{
		settings.width  = settings.dimension
		settings.height = settings.dimension
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

	// console.log(parameters)
	
	// resize the image
	return imagemagick.resizeAsync(parameters) // (error, output, errors_output) => {}
}

web.file_upload
({
	upload_folder,
	file_size_limit: configuration.image_service.file_size_limit,
	postprocess: async uploaded =>
	{
		const { file } = uploaded

		const from = path.resolve(upload_folder, file.uploaded_file_name)

		if (path.extname(file.original_file_name) === '.svg')
		{
			const file_name = file.uploaded_file_name + '.svg'

			const to = path.resolve(output_folder, file_name)

			await fs.copyAsync(from, to, { replace: false })

			const sizes = 
			[{
				name   : file_name,
				server : 1
			}]
			
			return { sizes }
		}

		const image_info = await imagemagick.identifyAsync(from)

		// image_info.width
		// image_info.height
		// image_info.format // 'JPEG', 'PNG', 
		// image_info['mime type'] // 'image/jpeg'

		if (image_info.format !== 'JPEG' && image_info.format !== 'PNG')
		{
			throw new Error('Only JPEG, PNG and SVG images are supported')
		}

		const dot_extension = image_info.format === 'PNG' ? '.png' : '.jpg'

		const sizes = []

		for (let image_size of image_sizes)
		{
			// if the image is smaller then the next resize step,
			// then generate no more resizes of this image
			if (image_info.width < image_size || image_info.height < image_size)
			{
				const file_name = file.uploaded_file_name + dot_extension
				const to = path.resolve(output_folder, file_name)

				await fs.copyAsync(from, to, { replace: false })

				sizes.push
				({
					width  : image_info.width,
					height : image_info.height,
					name   : file_name,
					server : 1
				})

				break
			}

			const to_temporary = from + dot_extension

			await resize(from, to_temporary, { width: image_size, height: image_size })
			const resized = await imagemagick.identifyAsync(to_temporary)

			const file_name = `${file.uploaded_file_name}@${resized.width}x${resized.height}${dot_extension}`

			const to = path.resolve(output_folder, file_name)

			await fs.copyAsync(to_temporary, to, { replace: false })

			sizes.push
			({
				width  : resized.width,
				height : resized.height,
				name   : file_name,
				server : 1
			})
		}

		return { sizes }
	}
})

web.listen(configuration.image_service.http.port).then(() =>
{
	log.info(`Image service is listening at http://${configuration.image_service.http.host}:${configuration.image_service.http.port}`)
},
error =>
{
	console.log('Image service shutdown')
	log.error(error)
})