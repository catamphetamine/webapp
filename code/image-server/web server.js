import koa          from 'koa'
import session      from 'koa-session'
import body_parser  from 'koa-bodyparser'
import mount        from 'koa-mount'
import graphql_http from 'koa-graphql'
import koa_router   from 'koa-router'

import imagemagick from 'imagemagick'
// import imagemagick from 'imagemagick-native'

import configuration from '../configuration'
global.configuration = configuration

import busboy from 'co-busboy'

import log from './log'

import path from 'path'
import fs   from 'fs-extra'

const web = koa()

const router = koa_router()

web.keys = ['hammertime']
web.use(session(web))

// Usage: this.request.body
web.use(body_parser({ formLimit: '100mb' }))

// handle errors
web.use(function* (next)
{
	try
	{
		yield next
	}
	catch (error)
	{
		// log the error
		log.error(error)

		this.status = error.code || 500
		this.message = error.message || 'Internal error'
	}
})

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

web.use(function*()
{
	if (!this.is('multipart/form-data'))
	{
		this.status = 404
		this.message = `Image server only accepts "multipart/form-data" POST requests`
		return
	}

	function generate_unique_filename(folder)
	{
		return new Promise((resolve, reject) =>
		{
			const file_name = Math.random().toString().slice(2)

			fs.existsAsync(path.join(folder, file_name)).then(exists =>
			{
				resolve(file_name)
			},
			error =>
			{
				reject(error)
			})
		})
	}

	const files = busboy(this)

	let file

	while (file = yield files)
	{
		log.debug(`Uploading: ${file.filename}`)

		const output_folder = path.resolve(Root_folder, configuration.image_server.temporary_files_directory)

		const file_name = yield generate_unique_filename(output_folder)
		const output_file = path.join(output_folder, file_name)

		yield new Promise((resolve, reject) =>
		{
			const stream = fs.createOutputStream(output_file)
			file.pipe(stream).on('finish', function()
			{
				resolve(path.relative(Root_folder, output_file))
			})
			.on('error', function(error)
			{
				reject(error)
			})
		})
		.then(path =>
		{
			this.body = { file_name: file_name }
		})
	}
})

web.listen(configuration.image_server.http.port, (error) =>
{
	if (error)
	{
		return log.error(error)
	}

	log.info(`Image server is listening at http://${configuration.image_server.http.host}:${configuration.image_server.http.port}`)
})