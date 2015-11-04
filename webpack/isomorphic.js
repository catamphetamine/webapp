var path = require('path')
var webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin')

module.exports = 
{
	// debug: true,

	webpack_assets_file_path: './build/webpack-assets.json',

	assets:
	{
		images:	
		{
			extensions:
			[
				'png',
				'jpg',
				'gif',
				'ico',
				'svg'
			],
			parser: webpack_isomorphic_tools_plugin.url_loader_parser
		},
		fonts:
		{
			extension: 'woff',
			parser: webpack_isomorphic_tools_plugin.url_loader_parser
		},
		styles:
		{
			extension: 'scss',
			filter: function(module, regular_expression, options, log)
			{
				if (options.development)
				{
					return webpack_isomorphic_tools_plugin.style_loader_filter(module, regular_expression, options, log)
				}

				// in production there will be no .scss assets 
				// because they will all be extracted by Extract Text Plugin,
				// and also because I don't use css-loader "modules" feature.

				// if (regular_expression.test(module.name))
				// {
				// 	log.error(`Unexpected .scss asset (in production mode): ${module.name}`)
				// }
			},
			path: webpack_isomorphic_tools_plugin.style_loader_path_extractor,
			parser: webpack_isomorphic_tools_plugin.css_loader_parser
		}
	}
}