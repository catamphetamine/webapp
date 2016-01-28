import web_server from '../common/web server'

import imagemagick from 'imagemagick'
// import imagemagick from 'imagemagick-native'

import path from 'path'
import fs   from 'fs-extra'

const web = web_server()

const resize_image = Promise.promisify(imagemagick.resize)

function resize(from, to, settings)
{
	const parameters = 
	{
		srcPath : from,
		dstPath : to,
		quality : 0.85,
		strip   : false,
		filter  : 'Lagrange'
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
	parameters.customArgs.add('-gravity')
	parameters.customArgs.add('center')
	
	if (options.max_dimension)
	{
		// уменьшить, если слишком большое
		parameters.width = options.max_dimension
		parameters.height = options.max_dimension + '>'
	}
	else if (options.dimension)
	{
		// заполнить как минимум весь размер
		parameters.width = options.dimension
		parameters.height = options.dimension + '^'
			
		// протяжённость, для сохранения aspect ratio
		parameters.customArgs.add('-extent')
		parameters.customArgs.add(options.dimension + 'x' + options.dimension)
	}
	else
	{
		parameters.width = options.width
			
		if (!options.crop)
		{
			parameters.height = options.height + '>'
		}
		else
		{
			parameters.height = options.height + '^'
		}
		
		// протяжённость, для выравнивания по высоте по середине
		parameters.customArgs.add('-extent')
		parameters.customArgs.add(options.width + 'x' + options.height)
	}
	
	return resize_image(parameters) // (error, output, errors_output) ->
}

web.file_upload
({
	output_folder: path.resolve(Root_folder, configuration.image_service.temporary_files_directory),
	root_folder: Root_folder
})

web.listen(configuration.image_service.http.port).then(() =>
{
	log.info(`Image service is listening at http://${configuration.image_service.http.host}:${configuration.image_service.http.port}`)
},
error =>
{
	log.error(error)
})