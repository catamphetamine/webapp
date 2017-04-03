import path from 'path'
import fs from 'fs-extra'

const output_folder = path.resolve(Root_folder, configuration.image_service.files_directory)

function permanent_path(file_name)
{
	return path.resolve(output_folder, file_name)
}

class Filesystem_storage
{
	// Indicates that there's no need to delete temporary files
	// after calling `.store()`.
	clean_up_after_store = false

	// "Statics" serving (serving saved images from filesystem)
	serve = output_folder

	async store(file_path, file_name)
	{
		await fs.moveAsync(file_path, permanent_path(file_name))
		return file_name
	}

	async dispose(file_name)
	{
		const image_path = permanent_path(file_name)

		if (await fs_exists(image_path))
		{
			await fs.unlinkAsync(image_path)
		}
	}
}

export default new Filesystem_storage()

// checks if filesystem path exists
function fs_exists(path)
{
	return new Promise((resolve, reject) =>
	{
		fs.exists(path, exists => resolve(exists))
	})
}