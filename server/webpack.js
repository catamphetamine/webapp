// import path from 'path'
// import webpack_configuration from '../webpack/webpack.config.js' // path.resolve(Root_folder, 'webpack', 'webpack.config.js')
// const stats_path = path.relative(__dirname, webpack_configuration.webpack_stats_path)

export function stats()
{
	// unable to replace this with a variable - webpack doesn't like variables inside require()
	const webpack_stats = require('../build/webpack-stats.json')

	if (_development_)
	{
		// Do not cache webpack stats: the script file would change since
		// hot module replacement is enabled in the development env
		//
		// unable to replace this with a variable - webpack doesn't like variables inside require()
		delete require.cache[require.resolve('../build/webpack-stats.json')]
	}

	return webpack_stats
}

// export function require_server_css(path)
// {
// 	if (_client_)
// 	{
// 		throw new Error('server-side only css resolver called on client')
// 	}
// 	return stats().css.modules[path.slice(__dirname.length)]
// }

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
	const image = images.find(img => regexp.test(img.original))

	// Serve image
	if (image)
	{
		return image.compiled
	}

	// Serve a not-found asset maybe?
	return ''
}

// /* A bit of a hack. A better way would be pass these functions through React context somehow */
// export function initialize_asset_loader()
// {
// 	assets.load_image = (path) => require_server_image(path)
// }