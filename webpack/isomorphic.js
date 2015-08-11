var webpack_isomorphic_tools = require('webpack-isomorphic-tools')

module.exports = 
{
	debug: true,

	assets:
	[{	
		extensions:
		[
			'png',
			'jpg',
			'gif',
			'ico',
			'svg'
		],
		loader: 'url-loader?limit=10240', // Any png-image or woff-font below or equal to 10K will be converted to inline base64 instead
		parser: webpack_isomorphic_tools.url_loader_parser
	}]
}