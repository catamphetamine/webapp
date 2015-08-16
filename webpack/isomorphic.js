var webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin')

module.exports = 
{
	debug: true,

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
		}
	}
}