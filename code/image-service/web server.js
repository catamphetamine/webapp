import web_server from '../common/web server'

import path from 'path'
import fs   from 'fs-extra'

import get_image_info         from './image info'
import { resize, autorotate } from './image manipulation'

const upload_folder = path.resolve(Root_folder, configuration.image_service.temporary_files_directory)
const output_folder = path.resolve(Root_folder, configuration.image_service.files_directory)

const web = web_server()

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

		const sizes = []

		for (let image_size of configuration.image_service.sizes)
		{
			// if the image is smaller then the next resize step,
			// then generate no more resizes of this image
			if (image_info.width < image_size || image_info.height < image_size)
			{
				const file_name = file.uploaded_file_name + dot_extension
				const to = path.resolve(output_folder, file_name)

				await autorotate(from, to)

				const resized = await get_image_info(to, { simple: true })

				sizes.push
				({
					width  : resized.width,
					height : resized.height,
					name   : file_name
				})

				break
			}

			const to_temporary = from + dot_extension

			await resize(from, to_temporary, { max_extent: image_size })
			const resized = await get_image_info(to_temporary, { simple: true })

			const file_name = `${file.uploaded_file_name}@${resized.width}x${resized.height}${dot_extension}`

			const to = path.resolve(output_folder, file_name)

			await fs.copyAsync(to_temporary, to, { replace: false })

			sizes.push
			({
				width  : resized.width,
				height : resized.height,
				name   : file_name
			})
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