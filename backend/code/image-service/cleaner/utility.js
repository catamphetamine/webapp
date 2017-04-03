import path_module from 'path'
import fs from 'fs'

// computes a size of a filesystem folder (or a file)
export function fs_size(path, callback)
{
	fs.lstat(path, function(error, stats)
	{
		if (error)
		{
			return callback(error)
		}

		if (!stats.isDirectory())
		{
			return callback(undefined, stats.size)
		}

		let total = stats.size

		fs.readdir(path, function(error, names)
		{
			if (error)
			{
				return callback(error)
			}

			let left = names.length

			if (left === 0)
			{
				return callback(undefined, total)
			}

			function done(size)
			{
				total += size

				left--
				if (left === 0)
				{
					callback(undefined, total)
				}
			}

			for (let name of names)
			{
				fs_size(path_module.join(path, name), function(error, size)
				{
					if (error)
					{
						return callback(error)
					}

					done(size)
				})
			}
		})
	})
}