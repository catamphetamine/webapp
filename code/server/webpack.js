// ideally client shouldn't know the "webpack" word.
// but currently there's no other way found to "require()" an image on the server

import webpack_configuration from '../../webpack/webpack.config.js'

let webpack_stats

export function stats()
{
	if (_client_)
	{
		throw new Error('Must not be called on client')
	}

	if (_development_ || !exists(webpack_stats))
	{
		// Do not cache webpack stats: the script file would change since
		// hot module replacement is enabled in the development env
		webpack_stats = load(webpack_configuration.webpack_stats_path)
	}

	return webpack_stats
}

export function require_server_image(path)
{
	if (!path)
	{
		return ''
	}

	if (_client_)
	{
		throw new Error('server-side only image resolver called on client')
	}

	const images = stats().images
	if (!images)
	{
		return ''
	}

	// Find the correct image
	const regexp = new RegExp(`${path}$`)
	const image = images.find(image => regexp.test(image.original))

	// Serve image
	if (image)
	{
		return image.compiled
	}

	// Serve a not-found asset maybe?
	return ''
}