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
	output.css = get_assets('main', 'css')

	// Find compiled images in modules
	// it will be used to map original filename to the compiled one
	// for server side rendering
	const images_regexp = this.options.regular_expressions.images_and_fonts
	output.images_and_fonts = json.modules
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