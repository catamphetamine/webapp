var fs   = require('fs')
var path = require('path')

var webpack_configuration = require(path.resolve(__dirname, '../webpack.config.js'))

var output_file_path = path.resolve(__dirname, '../../build/webpack-stats.json')
	
module.exports = function write_stats(stats, env)
{
	var publicPath = this.options.output.publicPath

	var json = stats.toJson()

	// get chunks by name and extensions
	function getChunks(name, ext)
	{
		ext = ext || 'js'
		var chunk = json.assetsByChunkName[name]

		// a chunk could be a string or an array, so make sure it is an array
		if (!(Array.isArray(chunk)))
		{
			chunk = [chunk]
		}

		return chunk
			// filter by extension
			.filter(function(chunkName)
			{
				return path.extname(chunkName) === '.' + ext
			})
			.map(function(chunkName)
			{
				return publicPath + chunkName
			})
	}

	var scripts = [getChunks('main', 'js')] // getChunks('common', 'js'), 
	var cssFiles = getChunks('main', 'css')

	var cssModules = {}

	var namePrefix = webpack_configuration
		.module
		.loaders
		.filter(loader => loader.test.toString() === webpack_configuration.regular_expressions.style.toString())
		.first()
		.loaders
		.slice(1)
		.map(loader =>
		{
		    const [name, parameters] = loader.split('?')
		    return `./~/${name}-loader?${parameters}`
		})
		.join('!')
		// don't know why an exclamation mark in the end
		+ '!'

	json.modules.filter(function(m)
	{
		if (env === 'production')
		{
			return /\.scss$/.test(m.name)
		}
		return m.name.slice(0, namePrefix.length) === namePrefix
	})
	.forEach(function(m)
	{
		var name = path.resolve(__dirname, '../../', env === 'production' ?
			m.name.slice('./src'.length) :
			m.name.slice(namePrefix.length + './src'.length))

		if (name)
		{
			// Resolve the e.g.: "C:\"  issue on windows
			const i = name.indexOf(':')
			if (i >= 0)
			{
				name = name.slice(i + 1)
			}
		}

		//end
		var regex = env === 'production' ? /module\.exports = ((.|\n)+);/ : /exports\.locals = ((.|\n)+);/
		var match = m.source.match(regex)
		cssModules[name] = match ? JSON.parse(match[1]) : {}
	})

	// Find compiled images in modules
	// it will be used to map original filename to the compiled one
	// for server side rendering
	const imagesRegex = /\.(jpe?g|png|gif|svg)$/
	const images = json.modules
		.filter(function(module)
		{
			return imagesRegex.test(module.name)
		})
		.map(function(image)
		{
			var i = image.source.indexOf('"')
			var imageSource = image.source.slice(i + 1, -1)
			imageSource = imageSource.lastIndexOf('data:image', 0) === 0 ? imageSource : publicPath + imageSource
			return {
				original: image.name,
				compiled: imageSource
			}
		})

	var content =
	{
		scripts: scripts,
		css:
		{
			files: cssFiles,
			modules: cssModules
		},
		images: images
	}

	fs.writeFileSync(output_file_path, JSON.stringify(content))
}