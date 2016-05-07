import language from '../code/common/language'
import path     from 'path'

import webpack             from 'webpack'
import base_configuration  from './webpack.config'
import clean_plugin        from 'clean-webpack-plugin'
import extract_text_plugin from 'extract-text-webpack-plugin'
import strip               from 'strip-loader'

import webpack_isomorphic_tools_plugin from 'webpack-isomorphic-tools/plugin'

import application_configuration from '../code/common/configuration'

const configuration = Object.clone(base_configuration)

const third_party_libraries =
[
	'babel-polyfill',
	'babel-runtime/core-js',
	'bluebird',
	'classnames',
	'core-js',
	'debug',
	'history',
	'intl',
	'intl-locales-supported',
	'intl-messageformat',
	'javascript-time-ago',
	'moment',
	'react',
	'react-addons-shallow-compare',
	'react-dnd',
	'react-dnd-html5-backend',
	'react-dom',
	'react-intl',
	'react-isomorphic-render',
	'react-redux',
	'react-router',
	'react-styling',
	'react-tap-event-plugin',
	'react-time-ago',
	'react-transform-catch-errors',
	'react-transform-hmr',
	'redux',
	'redux-router',
	'superagent',
	'webpack-hot-middleware'
]

configuration.entry =
{
	vendor   : third_party_libraries,
	// App.dll.js is not used, but including it here is required for
	// webpack-assets to be written properly
	// app      : [configuration.entry.main]
}

configuration.output.library  = '[name]_[hash]'
configuration.output.filename = '[name].dll.js'

configuration.plugins.unshift(new webpack.DllPlugin
({
	path: path.join(configuration.output.path, '[name]-manifest.json'),
	name: '[name]_[hash]'
}))

export default configuration