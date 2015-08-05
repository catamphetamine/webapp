import fs   from 'fs'
import path from 'path'

// writes webpack-stats.json file, which contains assets' file paths
export default function write_stats(stats, environment)
{
	const _production_  = environment === 'production'
	const _development_ = environment === 'development'

	const output_path = this.options.output.publicPath

	const json = stats.toJson()

	// get assets by name and extensions
	function get_assets(name, extension = 'js')
	{
		let chunk = json.assetsByChunkName[name]

		// a chunk could be a string or an array, so make sure it is an array
		if (!(Array.isArray(chunk)))
		{
			chunk = [chunk]
		}

		return chunk
			// filter by extension
			.filter(name => path.extname(name) === `.${extension}`)
			.map(name => output_path + name)
	}

	const output =
	{
		css:
		{
			modules: {}
		}
	}

	output.scripts = [get_assets('main', 'js')] // get_assets('common', 'js'), 
	output.css.files = get_assets('main', 'css')

	// this variable is only used when the enviroment is "development"
	// let css_module_name_prefix
	// if (_development_)
	// {
	// 	css_module_name_prefix = this.options
	// 		.module
	// 		.loaders
	// 		.filter(loader => loader.test.toString() === this.options.regular_expressions.styles.toString())
	// 		.first()
	// 		.loaders
	// 		.slice(1)
	// 		.map(loader =>
	// 		{
	// 		    const [name, parameters] = loader.split('?')
	// 		    return `./~/${name}-loader?${parameters}`
	// 		})
	// 		.join('!')
	// 		// don't know why an exclamation mark in the end
	// 		+ '!'
	// }
	//
	// json.modules.filter(module =>
	// {
	// 	if (_production_)
	// 	{
	// 		// get all modules with .scss extension
	// 		return this.options.regular_expressions.styles.test(module.name)
	// 	}
	// 	// omit the long css loader prefix when in developer mode
	// 	return module.name.slice(0, css_module_name_prefix.length) === css_module_name_prefix
	// })
	// .forEach(module =>
	// {
	// 	const path_prefix = path.resolve(this.options.context, this.options.assets_source_folder)
	//
	// 	// strip prefixes from css module name
	// 	let name = path.resolve(this.options.context, _production_ ?
	// 		module.name.slice(path_prefix.length) :
	// 		module.name.slice(css_module_name_prefix.length + path_prefix.length))
	//
	// 	// strip Windows drive path
	// 	if (name)
	// 	{
	// 		// Resolve the e.g.: "C:\"  issue on windows
	// 		const colon_index = name.indexOf(':')
	// 		if (colon_index >= 0)
	// 		{
	// 			name = name.slice(colon_index + 1)
	// 		}
	// 	}
	//
	// 	// get exported css module name for this css module name
	// 	const regexp = _production_ ? /module\.exports = ((.|\n)+);/ : /exports\.locals = ((.|\n)+);/
	// 	var match = module.source.match(regexp)
	// 	output.css.modules[name] = match ? JSON.parse(match[1]) : {}
	// })

	// Find compiled images in modules
	// it will be used to map original filename to the compiled one
	// for server side rendering
	const images_regexp = this.options.regular_expressions.images
	output.images = json.modules
		.filter(module => images_regexp.test(module.name))
		.map(image =>
		{
			// retain everything inside of double quotes (don't know what it is for)
			const double_qoute_index = image.source.indexOf('"')
			let image_source = image.source.slice(double_qoute_index + 1, -1)

			const is_embedded = image_source.lastIndexOf('data:image', 0) === 0
			image_source = is_embedded ? image_source : output_path + image_source

			const result = 
			{
				original: image.name,
				compiled: image_source
			}

			return result
		})

	// console.log(JSON.stringify(output, null, 2))

	fs.writeFileSync(this.options.webpack_stats_path, JSON.stringify(output))
}