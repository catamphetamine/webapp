import web_server, { fs_exists } from '../common/web server'

import path from 'path'
import fs   from 'fs-extra'

import get_image_info         from './image info'
import { resize, autorotate } from './image manipulation'

const upload_folder = path.resolve(Root_folder, configuration.image_service.temporary_files_directory)
const output_folder = path.resolve(Root_folder, configuration.image_service.files_directory)

const web = web_server({ parse_body: false, routing: '/api' })

web.post('/delete', async ({ target, image }) =>
{
	const image_target = configuration.image_service.target[target]

	if (!image_target)
	{
		throw new Error(`Unknown image-service target: "${target}"`)
	}

	for (let size of image.sizes)
	{
		const image_path = path.resolve(output_folder, image_target.path, size.name)

		if (await fs_exists(image_path))
		{
			await fs.unlinkAsync(image_path)
		}
	}
})

web.file_upload
({
	path: '/upload',
	upload_folder,
	file_size_limit: configuration.image_service.file_size_limit,
	postprocess: async uploaded =>
	{
		const { file, parameters } = uploaded

		const target = configuration.image_service.target[parameters.target]

		if (!target)
		{
			throw new Error(`Unknown image-service target: "${parameters.target}"`)
		}

		const from = path.resolve(upload_folder, file.uploaded_file_name)

		if (path.extname(file.original_file_name) === '.svg')
		{
			const file_name = file.uploaded_file_name + '.svg'

			const to = path.resolve(output_folder, target.path, file_name)

			await fs.copyAsync(from, to, { replace: false })

			const result =
			{
				sizes:
				[{
					name: file_name
				}],
				// server: 1
			}

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

		for (let max_extent of configuration.image_service.sizes)
		{
			const image_min_extent = Math.min(image_info.width, image_info.height)

			// if the image is smaller then the next resize step,
			// then generate no more resizes of this image
			if (image_min_extent < max_extent)
			{
				if (target.square)
				{
					await resize(from, to_temporary, { max_extent: image_min_extent, square: true })
				}
				else
				{
					await autorotate(from, to_temporary)
				}
			}
			else
			{
				await resize(from, to_temporary, { max_extent, square: target.square })
			}

			const resized = await get_image_info(to_temporary, { simple: true })
			const file_name = `${file.uploaded_file_name}@${resized.width}x${resized.height}${dot_extension}`

			const to = path.resolve(output_folder, target.path, file_name)
			await fs.moveAsync(to_temporary, to)

			sizes.push
			({
				width  : resized.width,
				height : resized.height,
				name   : file_name
			})

			if (image_min_extent < max_extent)
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

				const previous_path = path.resolve(output_folder, target.path, previous.name)
				await fs.unlinkAsync(previous_path)
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

		return result
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