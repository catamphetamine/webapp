import web_server, { fs_exists } from '../common/web server'

import path from 'path'
import fs   from 'fs-extra'

import get_image_info         from './image info'
import { resize, autorotate } from './image manipulation'
import database               from './database'

const upload_folder = path.resolve(Root_folder, configuration.image_service.temporary_files_directory)
const output_folder = path.resolve(Root_folder, configuration.image_service.files_directory)

function temporary_path(file_name)
{
	return path.resolve(upload_folder, file_name)
}

function permanent_path(file_name, type)
{
	return path.resolve(output_folder, type.path, file_name)
}

const web = web_server({ authentication: true, parse_body: false, routing: '/api' })

// temporary uploaded images
web.serve_static_files('/uploaded', upload_folder)

// saved uploaded images (user pictures, etc)
web.serve_static_files('/', output_folder)

web.get('/', async function({ skip, amount })
{
	this.role('administrator')

	skip = skip || 0
	amount = amount || 100

	return await database.get_batch(skip, amount)
})

web.delete('/', async ({ id }, { user }) =>
{
	if (!user)
	{
		throw new web.errors.Unauthenticated()
	}

	const image = await database.get(id)

	if (!image)
	{
		throw new web.errors.Not_found()
	}

	if (image.user !== user.id)
	{
		throw new web.errors.Unauthorized()
	}

	const image_type = configuration.image_service.type[image.type]

	if (!image_type)
	{
		throw new Error(`Unknown image-service type: "${type}"`)
	}

	for (let size of image.info.sizes)
	{
		const image_path = permanent_path(size.name, image_type)

		if (await fs_exists(image_path))
		{
			await fs.unlinkAsync(image_path)
		}
	}

	await database.delete(id)
})

web.post('/save', async ({ type, image }, { user }) =>
{
	if (!user)
	{
		throw new web.errors.Unauthenticated()
	}

	const image_type = configuration.image_service.type[type]

	if (!image_type)
	{
		throw new Error(`Unknown image-service type: "${type}"`)
	}

	if (!image)
	{
		throw new web.errors.Not_found()
	}

	for (let size of image.sizes)
	{
		await fs.moveAsync(temporary_path(size.name), permanent_path(size.name, image_type))
	}

	image.id = await database.create(user, type, image)

	return image
})

// returns:
//
// {
//	id: '507f191e810c19729de860ea',
// 	date: new Date(),
// 	location:
// 	{
// 		latitude: 34.25733333333334,
// 		longitue: 118.5373333333333
// 	},
// 	sizes:
// 	[{
// 		name: 'image@100x100.png',
// 		width: 100,
// 		height: 100
// 	},
// 	...]
// }
web.file_upload
({
	path: '/upload',
	upload_folder,
	file_size_limit: configuration.image_service.file_size_limit,
	postprocess: async function(uploaded)
	{
		const { file, parameters } = uploaded

		const image_type = configuration.image_service.type[parameters.type]

		if (!image_type)
		{
			throw new Error(`Unknown image-service type: "${parameters.type}"`)
		}

		const from = path.resolve(upload_folder, file.uploaded_file_name)

		if (path.extname(file.original_file_name) === '.svg')
		{
			const file_name = file.uploaded_file_name + '.svg'

			const to = temporary_path(file_name)

			await fs.copyAsync(from, to, { replace: false })

			const result =
			{
				sizes:
				[{
					name: file_name
				}],
				// server: 1
			}

			const image_info = Object.clone(result)
			image_info.sizes[0].file_size = (await fs.statAsync(to)).size

			return result
		}

		const image_info = await get_image_info(from)

		if (image_info.format !== 'JPEG' && image_info.format !== 'PNG')
		{
			throw new Error('Only JPEG, PNG and SVG images are supported')
		}

		const dot_extension = image_info.format === 'PNG' ? '.png' : '.jpg'
		const to_temporary = from + dot_extension

		const sizes = []
		const file_sizes = []

		const image_min_extent = Math.min(image_info.width, image_info.height)

		for (let max_extent of configuration.image_service.sizes)
		{
			// If the image is smaller than (or equal to) the current resize step extent
			// then don't stretch the image to the lengh of the current resize step extent
			// and leave its scale as it is.
			if (image_min_extent <= max_extent)
			{
				if (image_type.square)
				{
					await resize(from, to_temporary, { max_extent: image_min_extent, square: true })
				}
				else
				{
					await autorotate(from, to_temporary)
				}
			}
			// Otherwise scale down the image to the length of the current resize step extent
			else
			{
				await resize(from, to_temporary, { max_extent, square: image_type.square })
			}

			const resized = await get_image_info(to_temporary, { simple: true })
			const file_name = `${file.uploaded_file_name}@${resized.width}x${resized.height}${dot_extension}`

			const to = temporary_path(file_name)
			await fs.moveAsync(to_temporary, to)

			sizes.push
			({
				width  : resized.width,
				height : resized.height,
				name   : file_name
			})

			file_sizes.push((await fs.statAsync(to)).size)

			// If the image is smaller than (or equal to) the current resize step extent
			// then it means that the next (bigger) resize step won't be applied,
			// so just exit the loop and generate no more (bigger) resizes of this image.
			if (image_min_extent <= max_extent)
			{
				break
			}
		}

		await fs.unlinkAsync(from)

		// possibly eliminate the size previous to the biggest one,
		// if it's less than 10% different from the biggest size
		if (sizes.length > 1)
		{
			const biggest  = sizes[sizes.length - 1]
			const previous = sizes[sizes.length - 2]

			if ((biggest.width - previous.width) / previous.width < 0.1)
			{
				sizes.remove(previous)

				await fs.unlinkAsync(temporary_path(previous.name))
			}
		}

		const result =
		{
			sizes,
			// server: 1
		}

		if (image_info.date)
		{
			result.date = image_info.date
		}

		if (image_info.location)
		{
			result.location = image_info.location
		}

		const images_info = Object.clone(result)

		let i = 0
		while (i < images_info.sizes.length)
		{
			images_info.sizes[i].file_size = file_sizes[i]
			i++
		}

		return result
	}
})

web.listen(configuration.image_service.http.port).then(() =>
{
	log.info(`Image service is listening at http://${configuration.image_service.http.host}:${configuration.image_service.http.port}`)
},
error =>
{
	log.error(error, 'Image service shutdown')
})