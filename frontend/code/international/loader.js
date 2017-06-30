// https://github.com/gpbl/isomorphic500/blob/master/src/utils/IntlUtils.js

// Contains utils to download the locale data for the current language, eventually
// requiring the `Intl` polyfill for browser not supporting it
// It is used in client.js *before* rendering the root component.

import { addLocaleData } from 'react-intl'
import javascript_time_ago from 'javascript-time-ago'
import is_intl_locale_supported from 'intl-locales-supported'

import { get_language_from_locale } from '../../../code/locale'

// `react-intl` is already used in the project,
// so it initialized its internal `intl-messageformat`
// during `addLocaleData()` function call.
//
// https://github.com/yahoo/react-intl/blob/54d40377e1f6c2daf27030a8a5cda4cd2530060e/src/locale-data-registry.js#L15
//
// However, I guess, that's just
// the internal instance of `intl-messageformat`
// that gets localized, so a global instance
// of `intl-messageformat` is initialized here too.
//
require('javascript-time-ago/intl-messageformat-global')

// doesn't matter, just initialize it with something
// (this variable is for Webpack Hot Module Replacement)
let _locale = 'en'

// console output for debugging purposes
const debug = (...parameters) => console.log(parameters)

// Client-side bootstrap code.
// Loads `Intl` polyfill and all locale-specific data.
export default function internationalize(locale)
{
	// language
	locale = locale || document.documentElement.getAttribute('lang') || 'en'

	return load_intl_polyfill(locale).then(() =>
	{
		// Puts `ReactIntl` into the global scope:
		// this is required for adding locale-specific data.
		// `ReactIntl` needs the `Intl` polyfill to already be loaded.
		require('expose-loader?ReactIntl!react-intl')

		return load_locale_specific_data(locale)
	})
	.then(([react_intl_data, _, javascript_time_ago_data]) =>
	{
		if (locale !== 'en')
		{
			addLocaleData(react_intl_data)
		}

		javascript_time_ago.locale(javascript_time_ago_data)

		debug(`All locale-specific data for "${locale}" has been loaded`)
	})
}

// Loads `Intl` polyfill and its locale-specific data.
function load_intl_polyfill(locale)
{
	if (window.Intl && is_intl_locale_supported(locale))
	{
		// `Intl` is in the global scope and the locale data is available
		return Promise.resolve()
	}

	debug(`Intl${window.Intl ? ' locale data' : ''} for "${locale}" not available, downloading the polyfill...`)

	return Promise.all
	([
		import(/* webpackChunkName: "intl" */ 'intl'),
		load_language_specific_intl_data(locale)
	])
}

// Loads `Intl` locale-specific data.
function load_language_specific_intl_data(locale)
{
	// Do not remove code duplication via an inline `${locale}` variable,
	// otherwise Webpack will include **all** contents
	// of the `intl/locale-data/jsonp` folder in the bundle.
	switch (get_language_from_locale(locale))
	{
		// Russian
		case 'ru':
			return import(/* webpackChunkName: "intl-ru" */ 'intl/locale-data/jsonp/ru.js')

		// English
		default:
			return import(/* webpackChunkName: "intl-en" */ 'intl/locale-data/jsonp/en.js')
	}
}

// Loads all locale-specific data.
//
// For example, `react-intl` locale-specific data is used
// by `<FormattedRelative />` component.
//
function load_locale_specific_data(locale)
{
	// Do not remove code duplication via an inline `${locale}` variable,
	// otherwise Webpack will include **all** contents
	// of the locale data folders in the bundle.
	switch (get_language_from_locale(locale))
	{
		// Russian
		case 'ru':
			return Promise.all
			([
				import(/* webpackChunkName: "react-intl-ru" */ 'react-intl/locale-data/ru'),
				import(/* webpackChunkName: "intl-messageformat-ru" */ 'intl-messageformat/dist/locale-data/ru'),
				import(/* webpackChunkName: "javascript-time-ago-ru" */ 'javascript-time-ago/locales/ru')
			])

		// English
		default:
			return Promise.all
			([
				// (is hardcoded into `react-intl`)
				// import('react-intl/locale-data/en'),
				Promise.resolve(),
				import(/* webpackChunkName: "intl-messageformat-en" */ 'intl-messageformat/dist/locale-data/en'),
				import(/* webpackChunkName: "javascript-time-ago-en" */ 'javascript-time-ago/locales/en')
			])
	}
}

export function hot_reload_translation(on_reload)
{
	// `process.env.NODE_ENV !== 'production'` flag is needed here
	// to make sure that Webpack doesn't include
	// the whole `./international` folder into the `main` bundle
	// in production mode (because that's the sole point of code splitting)
	//
	if (process.env.NODE_ENV !== 'production' && module.hot)
	{
		module.hot.accept(require.resolve('./translations/' + window._current_locale + '.js'), function()
		{
			on_reload()
		})
	}
}

// This is purely for Webpack HMR in dev mode
export function load_translation(locale)
{
	// The `_locale` variable is used in Webpack HMR
	window._current_locale = locale

	switch (get_language_from_locale(locale))
	{
		case 'ru':
			return import('./translations/ru').then(module => module.default)

		default:
			return import('./translations/en').then(module => module.default)
	}
}