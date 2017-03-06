// Webpack DLL Plugin claims to speed up incremental Webpack builds
// https://github.com/erikras/react-redux-universal-hot-example/issues/616

import language from '../../code/language'
import path     from 'path'

import webpack             from 'webpack'
import base_configuration  from './webpack.config'

const configuration = Object.clone(base_configuration)

// Only client-side (and universal) libraries go here.
//
// If you put a server-side library here,
// then Webpack will likely throw an exception during DLL compilation.
//
// Also if you put here a library which depends on
// a server-side library (or which depends on a library
// which depends on a library ... which depends on
// a server-side library), then Webpack will throw an error too.
//
// So, only client-side libraries here
// (no require('fs'), require('net'), etc).
//
// Also it seems that libraries with expressions
// inside `require()` aren't suitable in this list too.
// ("Warning: the request of a dependency is an expression")
//
const third_party_libraries =
[
	'babel-preset-es2015',
	'babel-preset-react',
	'babel-preset-stage-2',
	'babel-polyfill',
	'babel-runtime/core-js',
	'bluebird',
	'classnames',
	'core-js',
	'filesize-parser',
	'history',
	'hoist-non-react-statics',
	'intl',
	'intl-locales-supported',
	'intl-messageformat',
	'javascript-time-ago',
	'minimist',
	'moment',
	'print-error',
	'react',
	'react-addons-shallow-compare',
	'react-dnd',
	'react-dnd-html5-backend',
	'react-dom',
	'react-intl',
	'react-isomorphic-render',
	'react-responsive-ui',
	'react-redux',
	'react-router',
	'react-sticky',
	'react-styling',
	'react-tap-event-plugin',
	'react-time-ago',
	'redux',
	'redux-logger',
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
	path : path.join(configuration.output.path, '[name]-manifest.json'),
	name : '[name]_[hash]'
}))

export default configuration